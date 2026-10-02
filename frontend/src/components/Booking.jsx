import { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, Copy, HandHeart, Video } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { FadeUp, Eyebrow } from "@/components/Reveal";

const MODES = ["Video / Audio (Zoom, Google Meet, WhatsApp)", "Office Visit", "Door-to-Door"];
const UPI = "7992461191@ybl";

const inputCls =
  "w-full border border-gold/25 bg-ink-800/60 px-4 py-3 text-sm text-paper placeholder:text-paper/35 transition-colors duration-200 focus:border-gold focus:outline-none";

export const Booking = () => {
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    mode: MODES[0],
    preferred_time: "",
    issue: "",
  });
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const { data } = await api.post("/bookings", form);
      toast.success(data.message || "Consultation request received.", {
        description: "We will contact you within 24 hours.",
      });
      setForm({ full_name: "", mobile: "", email: "", mode: MODES[0], preferred_time: "", issue: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(UPI);
      toast.success("UPI ID copied", { description: UPI });
    } catch {
      toast.error("Could not copy — UPI ID: " + UPI);
    }
  };

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
          {/* form */}
          <FadeUp delay={0.05}>
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
                    placeholder="Describe your legal matter briefly. You may attach documents over WhatsApp after booking."
                    className={inputCls}
                    data-testid="booking-input-issue"
                  />
                </label>
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
          </FadeUp>

          {/* payment + csr */}
          <div className="grid gap-8">
            <FadeUp delay={0.12}>
              <div className="border border-gold/25 bg-ink-800/70 p-7 sm:p-9" data-testid="payment-card">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Pay &amp; Confirm</p>
                <div className="mt-5 flex flex-wrap items-center gap-7">
                  <div className="bg-white p-3" data-testid="upi-qr-frame">
                    <img src="/brand/upi-qr.png" alt="UPI QR code for SpLegalMart" className="h-36 w-36" data-testid="upi-qr-img" />
                  </div>
                  <div className="grid gap-3">
                    <p className="text-sm text-paper/70">Scan with any UPI app</p>
                    <button
                      onClick={copyUpi}
                      data-testid="copy-upi-button"
                      className="group flex items-center gap-3 border border-gold/40 bg-ink-900/70 px-5 py-3 font-mono text-sm text-gold transition-colors duration-200 hover:border-gold"
                    >
                      {UPI}
                      <Copy className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
                    </button>
                    <p className="text-xs text-paper/50">PhonePe QR · UPI: {UPI}</p>
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
                  Programs · Save Life / Save Tree / Save Environment.
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
