import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, CalendarPlus, Clock, DoorOpen, Globe, RotateCcw, Search } from "lucide-react";
import { MaskedLine, FadeUp, EASE } from "@/components/Reveal";
import { scrollToId } from "@/lib/api";

const HIGHLIGHTS = [
  { icon: Clock, text: "24/7 Online Global Legal & Para-Legal Services" },
  { icon: DoorOpen, text: "Door-to-Door & Remote Legal Services" },
  { icon: RotateCcw, text: "100% Fee Refund If confirmed delivery is Delayed" },
  { icon: Globe, text: "Cheapest in the World · ₹199 PAN India · $5 Global" },
];

const STATS = [
  { value: "₹199", label: "Starting fee · PAN India" },
  { value: "$5", label: "Starting fee · Global" },
  { value: "24h", label: "Delivery commitment" },
  { value: "24/7", label: "Online availability" },
];

export const Hero = () => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 55, damping: 14 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 55, damping: 14 });
  const { scrollY } = useScroll();
  const emblemY = useTransform(scrollY, [0, 700], [0, 90]);
  const glowOpacity = useTransform(scrollY, [0, 500], [1, 0.2]);

  const onMouseMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      className="grain relative flex min-h-screen flex-col overflow-hidden bg-ink text-paper"
      onMouseMove={onMouseMove}
      data-testid="hero-section"
    >
      {/* gold spotlight */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div
          className="absolute -top-40 right-[-10%] h-[70vh] w-[60vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(212,161,62,0.22), rgba(212,161,62,0))" }}
        />
        <div
          className="absolute bottom-[-30%] left-[-15%] h-[60vh] w-[45vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(21,42,79,0.9), rgba(11,26,51,0))" }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-16 pt-32 sm:px-8 lg:pt-36">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          {/* copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
              className="inline-flex items-center gap-2 border border-gold/30 bg-gold/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold"
              data-testid="hero-tagline"
            >
              <Globe className="h-3.5 w-3.5" />
              A Global Platform for All Legal &amp; Para Legal Trusted Solutions
            </motion.p>

            <h1 className="mt-7 font-display text-[clamp(2.5rem,5vw,4.7rem)] font-medium leading-[1.06] tracking-tight">
              <MaskedLine delay={0.18}>PAN India &amp; Globally</MaskedLine>
              <MaskedLine delay={0.3}>
                <span className="gold-text italic">Trusted</span> Legal Services
              </MaskedLine>
              <MaskedLine delay={0.42}>Under One Roof.</MaskedLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.62 }}
              className="mt-7 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg"
              data-testid="hero-subhead"
            >
              Cost-efficient 24/7 online legal &amp; para-legal services for individuals, attorneys, companies,
              startups, NGOs, MSMEs, e-commerce &amp; enterprises — situated globally, anywhere. Book a consultation
              at any time by scanning the QR code or UPI ID.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.72 }}
              className="mt-4 text-sm text-paper/50"
              data-testid="hero-contact-line"
            >
              Call or drop a message on WhatsApp for any help:{" "}
              <a href="tel:+917992461191" className="text-gold hover:underline" data-testid="hero-phone-1">
                +91-7992461191
              </a>
              ,{" "}
              <a href="tel:+919650323162" className="text-gold hover:underline" data-testid="hero-phone-2">
                +91-9650323162
              </a>{" "}
              ·{" "}
              <a href="mailto:splegalmart@gmail.com" className="text-gold hover:underline" data-testid="hero-email">
                splegalmart@gmail.com
              </a>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.82 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <button
                onClick={() => scrollToId("#booking")}
                data-testid="hero-cta-book"
                className="group flex items-center gap-3 bg-gold px-8 py-4 text-sm font-semibold uppercase tracking-wider text-ink transition-all duration-200 hover:bg-gold-400"
              >
                <CalendarPlus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
                Book a Consultation
              </button>
              <button
                onClick={() => scrollToId("#services")}
                data-testid="hero-cta-services"
                className="group flex items-center gap-3 border border-paper/25 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-paper transition-all duration-200 hover:border-gold hover:text-gold"
              >
                <Search className="h-4 w-4" />
                Explore Services
              </button>
            </motion.div>

            <FadeUp delay={0.9} className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex max-w-xs items-center gap-2.5 text-[13px] font-medium text-paper/65"
                >
                  <Icon className="h-4 w-4 shrink-0 text-gold" /> {text}
                </span>
              ))}
            </FadeUp>
          </div>

          {/* emblem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
            className="relative mx-auto hidden w-full max-w-md lg:block"
            style={{ y: emblemY, perspective: 1000 }}
            data-testid="hero-emblem"
          >
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-gold/25 blur-3xl" aria-hidden="true" />
              <div className="relative rounded-full border border-gold/40 p-3 shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
                <img
                  src="/brand/seal.png"
                  alt="SpLegalMart official seal"
                  className="w-full rounded-full"
                  data-testid="hero-seal-img"
                />
                <span
                  className="absolute -right-3 top-8 flex h-24 w-24 items-center justify-center rounded-full border border-gold/50 bg-ink-800 text-center font-display text-lg italic text-gold"
                  style={{ transform: "translateZ(40px)" }}
                  data-testid="hero-emblem-badge"
                >
                  24/7
                  <br />
                  Online
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* stat strip */}
      <FadeUp delay={1.05} className="relative z-10 border-t border-gold/20 bg-ink-900/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gold/10 px-5 sm:px-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 px-6 py-6" data-testid="hero-stat">
              <span className="font-display text-3xl text-gold">{s.value}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-paper/50">{s.label}</span>
            </div>
          ))}
        </div>
      </FadeUp>

      <motion.button
        onClick={() => scrollToId("#about")}
        aria-label="Scroll to about"
        data-testid="hero-scroll-indicator"
        className="absolute bottom-28 left-1/2 z-10 hidden -translate-x-1/2 text-gold lg:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown className="h-5 w-5" />
      </motion.button>
    </section>
  );
};

export default Hero;
