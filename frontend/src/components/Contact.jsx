import { Clock, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { FadeUp, Eyebrow } from "@/components/Reveal";
import { scrollToId } from "@/lib/api";

export const Contact = () => (
  <section id="contact" className="grain relative bg-ink py-24 text-paper lg:py-32" data-testid="contact-section">
    <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
      <FadeUp>
        <Eyebrow dark>Contact Us — Get in Touch</Eyebrow>
        <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
          We are one message away,{" "}
          <span className="gold-text italic">around the clock.</span>
        </h2>
      </FadeUp>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <FadeUp delay={0.05}>
          <div className="grid gap-6 border border-gold/25 bg-ink-800/70 p-7 sm:p-10" data-testid="contact-info-card">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  <MapPin className="h-4 w-4" /> Head Office
                </p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80">Bawana, Delhi – 110040, India</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  <MapPin className="h-4 w-4" /> Branches
                </p>
                <p className="mt-2 text-sm leading-relaxed text-paper/80" data-testid="contact-branches">
                  Bukru, Kanke, Ranchi, Jharkhand – 834006 · Sheohar, Bihar · Bhatpara, 24 Pgs (WB) · Patna, Bihar
                </p>
              </div>
            </div>
            <div className="grid gap-4 border-t border-gold/15 pt-6 sm:grid-cols-2">
              <a href="tel:+917992461191" className="flex items-center gap-3 text-sm text-paper/80 transition-colors hover:text-gold" data-testid="contact-phone-1">
                <Phone className="h-4 w-4 text-gold" /> +91-7992461191
              </a>
              <a href="tel:+919650323162" className="flex items-center gap-3 text-sm text-paper/80 transition-colors hover:text-gold" data-testid="contact-phone-2">
                <Phone className="h-4 w-4 text-gold" /> +91-9650323162
              </a>
              <a href="https://wa.me/917992461191" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-paper/80 transition-colors hover:text-gold" data-testid="contact-whatsapp">
                <MessageCircle className="h-4 w-4 text-gold" /> WhatsApp: +91-7992461191
              </a>
              <a href="mailto:splegalmart@gmail.com" className="flex items-center gap-3 text-sm text-paper/80 transition-colors hover:text-gold" data-testid="contact-email-1">
                <Mail className="h-4 w-4 text-gold" /> splegalmart@gmail.com
              </a>
              <a href="mailto:info@splegalmart.com" className="flex items-center gap-3 text-sm text-paper/80 transition-colors hover:text-gold" data-testid="contact-email-2">
                <Mail className="h-4 w-4 text-gold" /> info@splegalmart.com
              </a>
              <span className="flex items-center gap-3 text-sm text-paper/80" data-testid="contact-hours">
                <Clock className="h-4 w-4 text-gold" /> 24/7 — Round the Clock
              </span>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.12}>
          <div className="flex h-full flex-col justify-between gap-8 bg-gold p-7 text-ink sm:p-10" data-testid="contact-cta-card">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                <Video className="h-4 w-4" /> Prefer instant booking?
              </p>
              <p className="mt-4 font-display text-3xl font-medium leading-tight">
                Consultation from ₹199 — scheduled in minutes.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">
                Video/Audio (Zoom, Google Meet, WhatsApp) · Office Visit · Door-to-Door. 100% fee refund if confirmed
                delivery is delayed.
              </p>
            </div>
            <div className="grid gap-3">
              <button
                onClick={() => scrollToId("#booking")}
                data-testid="contact-book-button"
                className="w-full bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-paper transition-colors duration-200 hover:bg-ink-700"
              >
                Book a Consultation
              </button>
              <a
                href="https://wa.me/917992461191"
                target="_blank"
                rel="noreferrer"
                data-testid="contact-whatsapp-button"
                className="flex w-full items-center justify-center gap-2 border border-ink/40 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  </section>
);

export default Contact;
