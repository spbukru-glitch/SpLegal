import os
import logging
import bcrypt
import jwt
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, Annotated

from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@splegalmart.com").lower()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="SpLegalMart API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("splegalmart")

JWT_ALGORITHM = "HS256"
BOOKING_STATUSES = {"new", "contacted", "scheduled", "completed", "cancelled"}


# ---------- MongoDB document base ----------
PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v))]


class BaseDocument(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    @classmethod
    def from_mongo(cls, doc):
        if not doc:
            return None
        data = dict(doc)
        data["_id"] = str(data["_id"])
        return cls(**data)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True)
        data.pop("_id", None)
        return data


# ---------- request / document models ----------
class LoginIn(BaseModel):
    email: str
    password: str


class BookingIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    mobile: str = Field(min_length=8, max_length=20)
    email: Optional[str] = Field(default=None, max_length=160)
    mode: str = Field(min_length=2, max_length=120)
    preferred_time: Optional[str] = Field(default=None, max_length=120)
    issue: str = Field(min_length=5, max_length=3000)


class Booking(BaseDocument):
    full_name: str
    mobile: str
    email: Optional[str] = None
    mode: str
    preferred_time: Optional[str] = None
    issue: str
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BookingStatusIn(BaseModel):
    status: str


class ServiceIn(BaseModel):
    name: str = Field(min_length=2, max_length=220)
    fee: str = Field(min_length=1, max_length=120)
    category: str = Field(default="General", max_length=80)


class Service(ServiceIn, BaseDocument):
    order: int = 0


# ---------- security helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": str(user["_id"]), "email": user.get("email"), "role": user.get("role")}


def booking_out(doc: dict) -> dict:
    d = dict(doc)
    d["_id"] = str(d["_id"])
    created = d.get("created_at")
    d["created_at"] = created.isoformat() if isinstance(created, datetime) else str(created)
    return d


def service_out(doc: dict) -> dict:
    d = dict(doc)
    d["_id"] = str(d["_id"])
    return d


# ---------- public endpoints ----------
@api_router.get("/")
async def root():
    return {"message": "SpLegalMart API is live"}


@api_router.get("/services")
async def list_services():
    docs = await db.services.find().sort("order", 1).to_list(500)
    return [service_out(d) for d in docs]


@api_router.post("/bookings")
async def create_booking(input: BookingIn):
    booking = Booking(**input.model_dump())
    await db.bookings.insert_one(booking.to_mongo())
    logger.info("New booking: %s (%s)", booking.full_name, booking.mobile)
    return {
        "id": booking.id,
        "message": "Consultation request received. Our team will contact you within 24 hours.",
    }


# ---------- auth ----------
@api_router.post("/auth/login")
async def login(input: LoginIn, request: Request, response: Response):
    email = input.email.strip().lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5 and datetime.now(timezone.utc) < attempts.get(
        "locked_until", datetime.now(timezone.utc)
    ):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user.get("password_hash", "")):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {
                "$inc": {"count": 1},
                "$set": {
                    "updated_at": datetime.now(timezone.utc),
                    "locked_until": datetime.now(timezone.utc) + timedelta(minutes=15),
                },
            },
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    return {"access_token": access, "user": {"id": uid, "email": email, "role": user.get("role")}}


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    access = create_access_token(str(user["_id"]), user.get("email", ""))
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    return {"access_token": access}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- admin: bookings ----------
@api_router.get("/admin/bookings")
async def admin_list_bookings(user: dict = Depends(get_current_user)):
    docs = await db.bookings.find().sort("created_at", -1).to_list(2000)
    return [booking_out(d) for d in docs]


@api_router.patch("/admin/bookings/{booking_id}")
async def admin_update_booking(booking_id: str, input: BookingStatusIn, user: dict = Depends(get_current_user)):
    if input.status not in BOOKING_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    try:
        oid = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    result = await db.bookings.update_one({"_id": oid}, {"$set": {"status": input.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    doc = await db.bookings.find_one({"_id": oid})
    return booking_out(doc)


@api_router.delete("/admin/bookings/{booking_id}")
async def admin_delete_booking(booking_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    result = await db.bookings.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted"}


# ---------- admin: services ----------
@api_router.post("/admin/services")
async def admin_create_service(input: ServiceIn, user: dict = Depends(get_current_user)):
    last = await db.services.find_one(sort=[("order", -1)])
    order = (last.get("order", 0) + 1) if last else 1
    service = Service(name=input.name, fee=input.fee, category=input.category, order=order)
    await db.services.insert_one(service.to_mongo())
    return service_out(service.model_dump())


@api_router.patch("/admin/services/{service_id}")
async def admin_update_service(service_id: str, input: ServiceIn, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service id")
    result = await db.services.update_one(
        {"_id": oid},
        {"$set": {"name": input.name, "fee": input.fee, "category": input.category}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    doc = await db.services.find_one({"_id": oid})
    return service_out(doc)


@api_router.delete("/admin/services/{service_id}")
async def admin_delete_service(service_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(service_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid service id")
    result = await db.services.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"message": "Service deleted"}


# ---------- seed ----------
SEED_SERVICES = [
    ("Initial Online Consultation (10 min)", "199", "Consultation"),
    ("Detailed Online Consultation (30 min)", "499", "Consultation"),
    ("Detailed Online Consultation (1 hr) / Office consultation", "999", "Consultation"),
    ("Drafting / Vetting (up to 3 pages)", "999", "Drafting & Vetting"),
    ("Drafting / Vetting (3-10 pages)", "4,999", "Drafting & Vetting"),
    ("Drafting / Vetting (over 10 pages)", "9,999", "Drafting & Vetting"),
    ("Complete Case Management (Annually)", "9,999", "Case Management"),
    ("Complete Case Management (One Time)", "49,999", "Case Management"),
    ("Corporate Retainer (Monthly)", "4,999", "Case Management"),
    ("Corporate Legal Audit / Property Document Vetting (up to 5p)", "999", "Corporate & Audit"),
    ("Property Document Vetting (over 5p) / Legal Audit", "4,999 / 9,999", "Corporate & Audit"),
    ("Government Liaisoning (Annually)", "9,999", "Government & Liaison"),
    ("EPC, JV, Commercial Contracts", "0.5% of project cost", "Corporate & Audit"),
    ("Employment Disputes (Annually / One Time)", "9,999 / 49,999", "Litigation"),
    ("International Dispute Resolution", "1% of cost", "Global"),
    ("IP Protection (Annually) / Corporate Legal Training", "9,999 / 4,999", "Intellectual Property"),
    ("Arbitration & Mediation (Annually / One Time)", "9,999 / 49,999", "Litigation"),
    ("Domestic Enquiry / Investigation", "9,999", "Litigation"),
    ("Custom/GST/Income Tax/EPF/ESI/Labour (per filing)", "499", "Compliance & Tax"),
    ("Criminal/Family/Property/Civil (Annually / One Time)", "9,999 / 49,999", "Litigation"),
    ("Factory Establishment & Compliance", "1% of project cost", "Compliance & Tax"),
    ("Land Verification, Acquisition & Registration", "0.5% of cost", "Property"),
    ("Company Registration & MCA Compliance", "1,999", "Compliance & Tax"),
    ("Court Representation (District, HC, Tribunals)", "999", "Representation"),
    ("Government Tender & Contract Assistance", "0.5% of cost", "Government & Liaison"),
    ("Door-to-Door Service (per visit)", "999 + travel", "Representation"),
]


async def seed():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    if not await db.users.find_one({"email": ADMIN_EMAIL}):
        await db.users.insert_one(
            {
                "email": ADMIN_EMAIL,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc),
            }
        )
        logger.info("Admin user seeded: %s", ADMIN_EMAIL)
    if await db.services.count_documents({}) == 0:
        for i, (name, fee, category) in enumerate(SEED_SERVICES):
            svc = Service(name=name, fee=fee, category=category, order=i + 1)
            await db.services.insert_one(svc.to_mongo())
        logger.info("Seeded %d services", len(SEED_SERVICES))


@app.on_event("startup")
async def startup():
    await seed()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
