import { Lock } from "lucide-react";
import { scrollToId } from "@/lib/api";

const COLS = [
  {
    title: "SpLegalMart",
    links: [
      { label: "About", hash: "#about" },
      { label: "Services", hash: "#services" },
      { label: "Pricing / Book", hash: "#booking" },
      { label: "Contact", hash: "#contact" },
    ],
  },
  {
    title: "Initiatives",
    links: [
      { label: "CSR", hash: "#booking" },
      { label: "Careers", hash: "#booking" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Email", href: "mailto:splegalmart@gmail.com" },
      { label: "WhatsApp", href: "https://wa.me/917992461191" },
      { label: "Call +91-7992461191", href: "tel:+917992461191" },
    ],
  },
];

export const Footer = () => (
  <footer className="grain relative overflow-hidden bg-ink-950 text-paper/70" data-testid="footer">
    <div className="relative z-10 mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8">
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src="/brand/seal.png" alt="SpLegalMart seal" className="h-12 w-12 rounded-full ring-1 ring-gold/50" />
            <span className="font-display text-2xl font-semibold text-paper">SpLegalMart</span>
          </div>
          <p className="mt-4 max-w-xs font-display text-xl italic text-gold/90">
            Your Rights. Our Responsibility. Secure &amp; Trusted.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 border border-gold/30 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-gold">
            <Lock className="h-3 w-3" /> 24/7 · PAN India &amp; Global
          </span>
        </div>
        {COLS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h5 className="text-xs font-semibold uppercase tracking-[0.24em] text-paper">{col.title}</h5>
            {col.links.map((l) =>
              l.hash ? (
                <a
                  key={l.label}
                  href={l.hash}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(l.hash);
                  }}
                  className="w-fit text-sm text-paper/60 transition-colors hover:text-gold"
                  data-testid={`footer-link-${l.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                >
                  {l.label}
                </a>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="w-fit text-sm text-paper/60 transition-colors hover:text-gold"
                  data-testid={`footer-link-${l.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                >
                  {l.label}
                </a>
              )
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 select-none overflow-hidden" aria-hidden="true">
        <p className="whitespace-nowrap text-center font-display text-[13.5vw] font-semibold leading-[0.9] text-paper/[0.05]">
          SpLegalMart
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gold/15 pt-6 text-xs text-paper/50">
        <span data-testid="footer-copyright">© 2026 SpLegalMart. All rights reserved.</span>
        <span className="flex items-center gap-4">
          <span data-testid="footer-tagline">Your Rights. Our Responsibility. Secure &amp; Trusted.</span>
          <a href="/admin" className="text-gold/70 transition-colors hover:text-gold" data-testid="footer-admin-link">
            Admin
          </a>
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
