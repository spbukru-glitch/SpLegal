import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, Phone } from "lucide-react";

export const FloatingActions = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    if (window.lenis) window.lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cls =
    "flex h-12 w-12 items-center justify-center border border-gold/40 bg-ink text-gold shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-gold hover:text-ink";

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col gap-3 sm:right-8" data-testid="floating-actions">
      <a
        href="https://wa.me/917992461191"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className={cls}
        data-testid="floating-whatsapp"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
      <a href="tel:+917992461191" aria-label="Call SpLegalMart" className={cls} data-testid="floating-call">
        <Phone className="h-5 w-5" />
      </a>
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={toTop}
            aria-label="Back to top"
            className={cls}
            data-testid="floating-top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActions;
