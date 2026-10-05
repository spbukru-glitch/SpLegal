import { useRef, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Copy, FileText, Globe, HandHeart, MessageCircle, RotateCcw, Video, X } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { FadeUp, Eyebrow } from "@/components/Reveal";

const MODES = ["Video / Audio (Zoom, Google Meet, WhatsApp)", "Office Visit", "Door-to-Door"];
const UPI = "7992461191@ybl";
const SKYDO = "8333555230";
const WHATSAPP = "917992461191";

const inputCls =
  "w-full border border-gold/25 bg-ink-800/60 px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition-colors duration-200 focus:border-gold focus:outline-none";

const emptyForm = { full_name: "", mobile: "", email: "", mode: MODES[0], preferred_time: "", issue: "" };

export const Booking = () => {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const fileRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File too large — maximum 10 MB");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("full_name", form.full_name);
      fd.append("mobile", form.mobile);
      fd.append("email", form.email);
      fd.append("mode", form.mode);
      fd.append("preferred_time", form.preferred_time);
      fd.append("issue", form.issue);
      if (file) fd.append("attachment", file);
      const { data } = await api.post("/bookings", fd);
      toast.success(data.message || "Consultation request received.");
      setSubmitted({ ...form, hadFile: !!file });
      setForm(emptyForm);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`, { description: value });
    } catch {
      toast.error(`Could not copy — ${label}: ${value}`);
    }
  };

  const waText = submitted
    ? encodeURIComponent(
        [
          "New consultation request — SpLegalMart website",
          "",
          `Name: ${submitted.full_name}`,
          `Mobile: ${submitted.mobile}`,
          submitted.email ? `Email: ${submitted.email}` : null,
          `Mode: ${submitted.mode}`,
          submitted.preferred_time ? `Preferred: ${submitted.preferred_time}` : null,
          `Issue: ${submitted.issue}`,
          submitted.hadFile ? "Document attached via website (shared securely)." : null,
        ]
          .filter(Boolean)
          .join("\n")
      )
    : "";

  return (
    <section id="booking" className="grain relative bg-ink py-24 text-paper lg:py-32" data-testid="booking-section">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <FadeUp>
          <Eyebrow dark>Booking — Schedule Instantly</Eyebrow>
          <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            Book a consultation <span className="gold-text italic">anytime, anywhere.</span>
          </h2>
        </FadeUp>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <FadeUp delay={0.05}>
            {submitted ? (
              <div className="flex h-full flex-col justify-center border border-gold/40 bg-ink-800/70 p-7 sm:p-10" data-testid="booking-success-panel">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  <CalendarCheck className="h-4 w-4" /> Request received
                </p>
                <h3 className="mt-4 font-display text-3xl font-medium leading-tight sm:text-4xl">
                  Thank you, {submitted.full_name.split(" ")[0]}.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-paper/70">
                  Your consultation request is saved and our team has been emailed. We will contact you within 24
                  hours. For an instant confirmation, send your details to us on WhatsApp now:
                </p>
                <div className="mt-8 grid gap-3">
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${waText}`}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="booking-whatsapp-handoff"
                    className="flex w-full items-center justify-center gap-3 bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-ink transition-colors duration-200 hover:bg-gold-400 sm:w-fit"
                  >
                    <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
                  </a>
                  <button
                    onClick={() => setSubmitted(null)}
                    data-testid="booking-new-request"
                    className="flex w-fit items-center gap-2 text-sm text-paper/60 transition-colors hover:text-gold"
                  >
                    <RotateCcw className="h-4 w-4" /> Send another request
                  </button>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-paper/45">
                  To confirm your slot, pay via the UPI QR or Skydo details on the right and share the payment
                  screenshot on WhatsApp.
                </p>
              </div>
            ) : (
              <form
                onSubmit={submit}
                className="border border-gold/25 bg-ink-800/70 p-7 sm:p-10"
                data-testid="booking-form"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Full Name *</span>
                    <input
                      required
                      value={form.full_name}
                      onChange={set("full_name")}
                      placeholder="Your full name"
                      className={inputCls}
                      data-testid="booking-input-name"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Mobile *</span>
                    <input
                      required
                      value={form.mobile}
                      onChange={set("mobile")}
                      placeholder="+91 ·····"
                      className={inputCls}
                      data-testid="booking-input-mobile"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@example.com"
                      className={inputCls}
                      data-testid="booking-input-email"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Preferred Mode *</span>
                    <select value={form.mode} onChange={set("mode")} className={inputCls} data-testid="booking-input-mode">
                      {MODES.map((m) => (
                        <option key={m} value={m} className="bg-ink text-paper">
                          {m}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                      Preferred Time / Mode of Consultation
                    </span>
                    <input
                      value={form.preferred_time}
                      onChange={set("preferred_time")}
                      placeholder="e.g. Today 6 PM · Zoom call"
                      className={inputCls}
                      data-testid="booking-input-time"
                    />
                  </label>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Brief of Your Issue *</span>
                    <textarea
                      required
                      rows={4}
                      value={form.issue}
                      onChange={set("issue")}
                      placeholder="Describe your legal matter briefly."
                      className={inputCls}
                      data-testid="booking-input-issue"
                    />
                  </label>
                  <div className="grid gap-2 sm:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                      Attach Document (optional)
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={pickFile}
                      className="hidden"
                      data-testid="booking-input-attachment"
                    />
                    {file ? (
                      <span
                        className="flex w-fit items-center gap-3 border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-paper"
                        data-testid="booking-attachment-chip"
                      >
                        <FileText className="h-4 w-4 text-gold" />
                        {file.name} <span className="text-xs text-paper/50">({Math.ceil(file.size / 1024)} KB)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          aria-label="Remove attachment"
                          className="text-paper/50 transition-colors hover:text-red-400"
                          data-testid="booking-attachment-remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-fit items-center gap-2 border border-dashed border-gold/40 px-5 py-3 text-sm text-paper/70 transition-colors duration-200 hover:border-gold hover:text-paper"
                        data-testid="booking-attachment-picker"
                      >
                        <FileText className="h-4 w-4 text-gold" /> PDF / Image / Word · max 10 MB
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  data-testid="booking-submit-button"
                  className="mt-7 flex w-full items-center justify-center gap-3 bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-ink transition-colors duration-200 hover:bg-gold-400 disabled:opacity-60 sm:w-auto"
                >
                  <CalendarCheck className="h-4 w-4" />
                  {sending ? "Sending…" : "Request Consultation"}
                </button>
                <p className="mt-4 text-xs leading-relaxed text-paper/45">
                  After submitting, pay via UPI/QR below and share the screenshot on WhatsApp (+91-7992461191) to
                  confirm your slot.
                </p>
              </form>
            )}
          </FadeUp>

          {/* payment + csr */}
          <div className="grid gap-8">
            <FadeUp delay={0.12}>
              <div className="border border-gold/25 bg-ink-800/70 p-7 sm:p-9" data-testid="payment-card">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Pay &amp; Confirm · India</p>
                <div className="mt-5 flex flex-wrap items-center gap-7">
                  <div className="bg-white p-3" data-testid="upi-qr-frame">
                    <img src="/brand/upi-qr.png" alt="UPI QR code for SpLegalMart" className="h-36 w-36" data-testid="upi-qr-img" />
                  </div>
                  <div className="grid gap-3">
                    <p className="text-sm text-paper/70">Scan with any UPI app</p>
                    <button
                      onClick={() => copy(UPI, "UPI ID")}
                      data-testid="copy-upi-button"
                      className="group flex items-center gap-3 border border-gold/40 bg-ink-900/70 px-5 py-3 font-mono text-sm text-gold transition-colors duration-200 hover:border-gold"
                    >
                      {UPI}
                      <Copy className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
                    </button>
                    <p className="text-xs text-paper/50">PhonePe QR · UPI: {UPI}</p>
                  </div>
                </div>
                <div className="mt-6 border-t border-gold/15 pt-5" data-testid="payment-skydo-block">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                    <Globe className="h-4 w-4" /> International Payments · Skydo
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => copy(SKYDO, "Skydo account number")}
                      data-testid="copy-skydo-button"
                      className="group flex items-center gap-3 border border-gold/40 bg-ink-900/70 px-5 py-3 font-mono text-sm text-gold transition-colors duration-200 hover:border-gold"
                    >
                      A/c No. {SKYDO}
                      <Copy className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
                    </button>
                    <p className="text-xs text-paper/50" data-testid="skydo-holder">
                      Account Holder: SPlegalmart · For international clients paying in USD &amp; other currencies
                    </p>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.18}>
              <div className="border border-gold/25 bg-ink-800/70 p-7 sm:p-9" data-testid="csr-careers-card">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  <HandHeart className="h-4 w-4" /> CSR &amp; Careers
                </p>
                <p className="mt-4 text-sm leading-relaxed text-paper/70">
                  <span className="font-semibold text-paper">CSR:</span> Free Legal Aid Camps · Legal Literacy
                  Programs · Green Mission — Save Life / Save Tree / Save Environment.{" "}
                  <a href="/csr" className="text-gold hover:underline" data-testid="booking-csr-link">
                    Explore our CSR page
                  </a>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-paper/70">
                  <span className="font-semibold text-paper">Careers:</span> Advocates, Legal Interns, Legal Tech,
                  Freelance Legal Managers — send CV to{" "}
                  <a href="mailto:splegalmart@gmail.com" className="text-gold hover:underline" data-testid="careers-email-link">
                    splegalmart@gmail.com
                  </a>
                </p>
                <span className="mt-5 inline-flex items-center gap-2 bg-ink-900/80 px-4 py-2 text-xs font-medium text-gold ring-1 ring-gold/30" data-testid="careers-eligibility-chip">
                  <Video className="h-3.5 w-3.5" /> LL.B. / Bar Council · 1+ year · PAN India
                </span>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
