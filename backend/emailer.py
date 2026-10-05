import os
import re
import ipaddress
import logging
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("splegalmart.email")

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "SpLegalMart")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL", "splegalmart@gmail.com")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json=payload,
        )
    resp.raise_for_status()
    return resp.json().get("id")


def _row(label: str, value: str) -> str:
    return (
        f'<tr><td style="padding:6px 0;color:#8a8f98;font-size:12px;text-transform:uppercase;'
        f'letter-spacing:1px;vertical-align:top;width:120px">{label}</td>'
        f'<td style="padding:6px 0;color:#1e1e2a;font-size:14px">{value}</td></tr>'
    )


async def send_booking_notification(booking: dict) -> None:
    """Notify the admin inbox about a new consultation booking. Never raises."""
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set — skipping booking notification")
        return
    try:
        name = escape(booking.get("full_name", ""))
        rows = [
            _row("Name", name),
            _row("Mobile", escape(booking.get("mobile", ""))),
            _row("Email", escape(booking.get("email") or "—")),
            _row("Mode", escape(booking.get("mode", ""))),
            _row("Preferred", escape(booking.get("preferred_time") or "—")),
            _row("Issue", escape(booking.get("issue", ""))),
        ]
        attachment = booking.get("attachment")
        if attachment:
            size_kb = max(1, round(attachment.get("size", 0) / 1024))
            rows.append(
                _row("Document", f'{escape(attachment.get("original_filename", "file"))} ({size_kb} KB) — download it from the admin panel')
            )
        admin_url = ((os.environ.get("CORS_ORIGINS", "").split(",")[0] or "").strip().rstrip("/") + "/admin") or "#"
        subject = f"New consultation request — {booking.get('full_name', '')}"
        html = (
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
            'style="background:#f9f8f6;padding:24px;font-family:Arial,sans-serif"><tr><td align="center">'
            '<table role="presentation" width="560" cellpadding="0" cellspacing="0" '
            'style="background:#ffffff;border:1px solid #e5e2db">'
            '<tr><td style="background:#0b1a33;padding:18px 24px">'
            f'<span style="color:#d4a13e;font-size:18px;font-weight:bold">{escape(EMAIL_FROM_NAME)}</span>'
            '<span style="color:#ffffff;font-size:12px;float:right">New consultation request</span>'
            "</td></tr>"
            '<tr><td style="padding:24px">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0">{"".join(rows)}</table>'
            '<p style="margin:22px 0 0">'
            f'<a href="{admin_url}" style="background:#d4a13e;color:#0b1a33;padding:10px 20px;'
            'text-decoration:none;font-weight:bold;font-size:13px">Open Admin Panel</a></p>'
            f'<p style="margin:22px 0 0;font-size:12px;color:#888">Sent by {escape(EMAIL_FROM_NAME)}. '
            "We never ask for your password or card details by email.</p>"
            "</td></tr></table></td></tr></table>"
        )
        email_id = await send_email(to=NOTIFICATION_EMAIL, subject=subject, html=html)
        logger.info("Booking notification email sent: %s", email_id)
    except Exception as e:
        logger.error("Booking notification failed: %s", e)
