# PRD — SpLegalMart

## Original Problem Statement
Convert the provided SpLegalMart HTML landing page (global legal & para-legal services platform) into a full-stack app: premium landing page keeping the navy/gold brand and the attached SP logo, a booking form saved to a database, and a secure admin panel (login "admin123" style) to manage services, pricing, and bookings in real time. UPI payment shown as static info with copyable UPI ID + real scannable QR code.

## User Personas
- **Client (individual/startup/company/NGO/MSME, PAN India or global)**: browses services & transparent pricing, books a consultation online (video/office/door-to-door), pays via UPI QR.
- **Admin (SpLegalMart owner)**: logs into /admin, sees new consultation requests in real time, updates booking statuses, edits/adds/removes services & fees that publish instantly to the public price list.

## Architecture
- **Backend**: FastAPI (port 8001, /api prefix), Motor + MongoDB (test_database). JWT auth (bcrypt + PyJWT), brute-force lockout (5 fails → 15 min). Collections: users, services, bookings, login_attempts.
- **Frontend**: React (CRA) + Tailwind + shadcn/ui + framer-motion + lenis smooth scroll + sonner toasts. Fonts: Cormorant Garamond (display) + Manrope (body). Colors: ink #0b1a33 / gold #d4a13e / paper #f9f8f6.
- **Brand assets**: /frontend/public/brand/ — seal.png (circular seal from user's logo), upi-qr.png (real scannable UPI QR for 7992461191@ybl), favicon.svg.

## Core Requirements (static)
1. One-page landing: hero (masked line reveal, parallax emblem, stat strip), values marquee, about + 3 expertise areas + mission/vision + core values, 26-row services & pricing table grouped by category, booking form, payment/QR card, CSR & careers, why-choose bento + 6-step process, contact (head office Bawana Delhi-110040 + 4 branches + phones/WhatsApp/emails), footer with giant wordmark, floating WhatsApp/call/top buttons.
2. All original facts kept exactly: phones +91-7992461191 / +91-9650323162, splegalmart@gmail.com + info@splegalmart.com, UPI 7992461191@ybl, fees ₹199–₹49,999 + % models, ₹199 PAN India / $5 global, 100% refund guarantee, 24-hour delivery, © 2026.

## Implemented (with dates)
- 2026-10-02: Backend API — auth (login/logout/refresh/me with httpOnly cookies + bearer), public GET /api/services, POST /api/bookings; admin CRUD for bookings (list/status/delete) and services (create/edit/delete); startup seeding of admin user + 26 services.
- 2026-10-02: Frontend landing page — all sections above, lenis smooth scrolling, framer-motion reveals + masked hero headline + 3D tilt emblem, slow editorial marquee, live pricing from API with static fallback.
- 2026-10-02: Admin panel /admin — JWT login page, dashboard with Bookings tab (real-time poll every 15s, status select, delete, new-bookings badge) and Services tab (add/edit/delete with dialog).
- 2026-10-02: Assets — seal.png from user logo, real UPI QR, SVG favicon, copy-to-clipboard UPI chip.

## Backlog / Prioritized
- P0: none pending (core flows verified end-to-end).
- P1: WhatsApp deep-link prefill after booking submit; email notification on new booking (Resend); booking date-picker; file/document upload with object storage.
- P2: Blogs/Judgments resources section; Privacy Policy & Terms pages; client portal with case status; online payment capture (UPI intent deep links / gateway); multi-language (Hindi).

## Next Tasks
1. Email notifications to admin on new bookings (Resend integration).
2. WhatsApp redirect with prefilled message after booking form submit.
3. Resources section (blogs, judgments) managed from admin panel.

## Test Credentials
See /app/memory/test_credentials.md — admin@splegalmart.com / admin123.
