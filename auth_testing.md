# Auth Testing — SpLegalMart

## Credentials
- Admin: admin@splegalmart.com / admin123 (seeded on backend startup from backend/.env)
- Stored also in /app/memory/test_credentials.md

## MongoDB verification
```
mongosh
use test_database
db.users.find({role:"admin"}).pretty()
```
Verify: bcrypt hash starts with $2b$, unique index on users.email, index on login_attempts.identifier.

## API verification (external host)
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@splegalmart.com","password":"admin123"}'
```
Login returns {access_token, user} and sets access_token/refresh_token httpOnly cookies.

Chained admin call:
```
TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@splegalmart.com","password":"admin123"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
curl -s "$API_URL/api/admin/bookings" -H "Authorization: Bearer $TOKEN"
```

## Public endpoints
- GET /api/services — seeded price list (26 rows on first boot)
- POST /api/bookings — full_name, mobile, email?, mode, preferred_time?, issue

## Brute force
5 failed logins per ip:email → 15-minute lockout (HTTP 429).
