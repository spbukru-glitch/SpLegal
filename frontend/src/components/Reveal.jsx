import { motion, useReducedMotion } from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1];

export function FadeUp({ children, delay = 0, className = "", y = 28 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      data-testid={className.includes("data") ? undefined : undefined}
    >
      {children}
    </motion.div>
  );
}

export function MaskedLine({ children, delay = 0, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block will-change-transform"
        initial={reduce ? false : { y: "112%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Eyebrow({ children, dark = false, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${
        dark ? "text-gold" : "text-gold-600"
      } ${className}`}
    >
      <span className={`h-px w-8 ${dark ? "bg-gold/70" : "bg-gold-600/70"}`} aria-hidden="true" />
      {children}
    </span>
  );
}
