import os
import logging
import uuid
import bcrypt
import jwt
import requests
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Optional, Annotated

from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Form, Query
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
CSR_MEDIA_TYPES = {"photo", "video", "blog", "article", "social"}

# ---------- object storage (Emergent objstore) ----------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "splegalmart"
storage_key = None


def init_storage(force: bool = False) -> str:
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 404:
        init_storage(force=True)
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        init_storage(force=True)
        key = init_storage()
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "pdf": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
BOOKING_FILE_EXTS = {"pdf", "jpg", "jpeg", "png", "doc", "docx"}
CSR_PHOTO_EXTS = {"jpg", "jpeg", "png", "webp"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024


async def save_upload(file: UploadFile, subfolder: str, allowed: set) -> dict:
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "bin"
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")
    data = await file.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")
    content_type = file.content_type or MIME_TYPES.get(ext, "application/octet-stream")
    path = f"{APP_NAME}/{subfolder}/{uuid.uuid4().hex}.{ext}"
    result = put_object(path, data, content_type)
    meta = {
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result["size"],
    }
    await db.files.insert_one(
        {"id": str(uuid.uuid4()), **meta, "is_deleted": False, "created_at": datetime.now(timezone.utc)}
    )
    return meta


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


def extract_user_payload(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        q = request.query_params.get("auth")
        if q:
            token = q
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
    return payload


async def get_current_user(request: Request) -> dict:
    payload = extract_user_payload(request)
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


def csr_out(doc: dict) -> dict:
    d = dict(doc)
    d["_id"] = str(d["_id"])
    created = d.get("created_at")
    d["created_at"] = created.isoformat() if isinstance(created, datetime) else str(created)
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
async def create_booking(
    full_name: str = Form(...),
    mobile: str = Form(...),
    mode: str = Form(...),
    issue: str = Form(...),
    email: Optional[str] = Form(None),
    preferred_time: Optional[str] = Form(None),
    attachment: Optional[UploadFile] = File(None),
):
    if not (2 <= len(full_name.strip()) <= 120):
        raise HTTPException(status_code=400, detail="Full name must be 2-120 characters")
    if not (8 <= len(mobile.strip()) <= 20):
        raise HTTPException(status_code=400, detail="Mobile number looks invalid")
    if not (5 <= len(issue.strip()) <= 3000):
        raise HTTPException(status_code=400, detail="Please describe your issue (5+ characters)")

    attachment_meta = None
    if attachment and attachment.filename:
        attachment_meta = await save_upload(attachment, "bookings", BOOKING_FILE_EXTS)

    doc = {
        "full_name": full_name.strip(),
        "mobile": mobile.strip(),
        "email": (email or "").strip() or None,
        "mode": mode,
        "preferred_time": (preferred_time or "").strip() or None,
        "issue": issue.strip(),
        "attachment": attachment_meta,
        "status": "new",
        "created_at": datetime.now(timezone.utc),
    }
    await db.bookings.insert_one(doc)
    logger.info("New booking: %s (%s) attachment=%s", doc["full_name"], doc["mobile"], bool(attachment_meta))
    return {
        "message": "Consultation request received. Our team will contact you within 24 hours."
    }


@api_router.get("/csr/media")
async def list_csr_media():
    docs = await db.csr_media.find({"published": True}).sort("created_at", -1).to_list(200)
    return [csr_out(d) for d in docs]


@api_router.get("/csr/media/{media_id}/file")
async def csr_media_file(media_id: str):
    try:
        oid = ObjectId(media_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid media id")
    doc = await db.csr_media.find_one({"_id": oid, "published": True})
    if not doc or not doc.get("storage_path"):
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(doc["storage_path"])
    return Response(content=data, media_type=doc.get("content_type") or content_type)


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


@api_router.get("/admin/bookings/{booking_id}/attachment")
async def admin_booking_attachment(booking_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid booking id")
    doc = await db.bookings.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Booking not found")
    attachment = doc.get("attachment")
    if not attachment:
        raise HTTPException(status_code=404, detail="No attachment on this booking")
    data, content_type = get_object(attachment["storage_path"])
    return Response(
        content=data,
        media_type=attachment.get("content_type") or content_type,
        headers={"Content-Disposition": f'attachment; filename="{attachment.get("original_filename", "document")}"'},
    )


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


# ---------- admin: CSR media ----------
@api_router.get("/admin/csr/media")
async def admin_list_csr_media(user: dict = Depends(get_current_user)):
    docs = await db.csr_media.find().sort("created_at", -1).to_list(500)
    return [csr_out(d) for d in docs]


@api_router.post("/admin/csr/media")
async def admin_create_csr_media(
    title: str = Form(...),
    caption: Optional[str] = Form(None),
    media_type: str = Form("photo"),
    url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    user: dict = Depends(get_current_user),
):
    if media_type not in CSR_MEDIA_TYPES:
        raise HTTPException(status_code=400, detail="Invalid media type")
    if not (2 <= len(title.strip()) <= 160):
        raise HTTPException(status_code=400, detail="Title must be 2-160 characters")

    storage_path = None
    content_type = None
    if media_type == "photo":
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="Photo media requires an image file")
        meta = await save_upload(file, "csr", CSR_PHOTO_EXTS)
        storage_path = meta["storage_path"]
        content_type = meta["content_type"]
    else:
        if not url or not url.strip():
            raise HTTPException(status_code=400, detail="Link-based media requires a URL")

    doc = {
        "title": title.strip(),
        "caption": (caption or "").strip() or None,
        "media_type": media_type,
        "url": (url or "").strip() or None,
        "storage_path": storage_path,
        "content_type": content_type,
        "published": True,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.csr_media.insert_one(doc)
    doc["_id"] = result.inserted_id
    return csr_out(doc)


@api_router.delete("/admin/csr/media/{media_id}")
async def admin_delete_csr_media(media_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(media_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid media id")
    result = await db.csr_media.update_one({"_id": oid}, {"$set": {"published": False}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"message": "Media removed"}


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
    await db.csr_media.create_index("created_at")
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
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error("Object storage init failed: %s", e)


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
