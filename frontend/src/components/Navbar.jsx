import { useEffect, useState } from "react";
import { CalendarCheck, Gavel, Menu, Phone, X } from "lucide-react";
import { scrollToId } from "@/lib/api";

const LINKS = [
  { label: "About", hash: "#about" },
  { label: "Services", hash: "#services" },
  { label: "Booking", hash: "#booking" },
  { label: "CSR", route: "/csr" },
  { label: "Contact", hash: "#contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (hash) => (e) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(hash);
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "bg-ink/95 backdrop-blur-md border-b border-gold/20"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-[72px] items-center justify-between gap-6">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (window.lenis) window.lenis.scrollTo(0);
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3"
            data-testid="nav-logo-link"
          >
            <img
              src="/brand/seal.png"
              alt="SpLegalMart emblem"
              className="h-11 w-11 rounded-full ring-1 ring-gold/60 shadow-[0_0_24px_rgba(212,161,62,0.25)]"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-semibold tracking-wide text-paper">SpLegalMart</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">Global Legal Services</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) =>
              l.route ? (
                <a
                  key={l.route}
                  href={l.route}
                  data-testid={`nav-link-csr`}
                  className="text-sm font-medium text-paper/80 transition-colors duration-200 hover:text-gold"
                >
                  {l.label}
                </a>
              ) : (
                <a
                  key={l.hash}
                  href={l.hash}
                  onClick={go(l.hash)}
                  data-testid={`nav-link-${l.hash.slice(1)}`}
                  className="text-sm font-medium text-paper/80 transition-colors duration-200 hover:text-gold"
                >
                  {l.label}
                </a>
              )
            )}
            <a
              href="tel:+917992461191"
              data-testid="nav-call-link"
              className="flex items-center gap-2 text-sm font-medium text-paper/80 transition-colors hover:text-gold"
            >
              <Phone className="h-4 w-4 text-gold" /> +91-7992461191
            </a>
            <a
              href="#booking"
              onClick={go("#booking")}
              data-testid="nav-book-cta"
              className="group flex items-center gap-2 bg-gold px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-gold-400"
            >
              <CalendarCheck className="h-4 w-4" /> Book Now
            </a>
          </nav>

          <button
            className="text-paper lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            data-testid="nav-menu-toggle"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gold/20 bg-ink/95 px-6 pb-6 pt-2 backdrop-blur-md lg:hidden">
          {LINKS.map((l) =>
            l.route ? (
              <a
                key={l.route}
                href={l.route}
                onClick={() => setOpen(false)}
                data-testid="nav-mobile-link-csr"
                className="flex items-center gap-3 border-b border-white/5 py-4 text-paper/90"
              >
                <Gavel className="h-4 w-4 text-gold" /> {l.label}
              </a>
            ) : (
              <a
                key={l.hash}
                href={l.hash}
                onClick={go(l.hash)}
                data-testid={`nav-mobile-link-${l.hash.slice(1)}`}
                className="flex items-center gap-3 border-b border-white/5 py-4 text-paper/90"
              >
                <Gavel className="h-4 w-4 text-gold" /> {l.label}
              </a>
            )
          )}
          <a
            href="#booking"
            onClick={go("#booking")}
            data-testid="nav-mobile-book-cta"
            className="mt-5 flex items-center justify-center gap-2 bg-gold px-5 py-3 text-sm font-semibold text-ink"
          >
            <CalendarCheck className="h-4 w-4" /> Book a Consultation
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
