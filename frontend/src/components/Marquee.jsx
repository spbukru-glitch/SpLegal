const VALUES = ["Integrity", "Excellence", "Confidentiality", "Client-Centric", "Accountability"];

export const Marquee = () => {
  const row = (ariaHidden) => (
    <div aria-hidden={ariaHidden || undefined} className="flex shrink-0 items-center">
      {VALUES.map((v) => (
        <span key={v} className="flex items-center">
          <span className="px-8 font-display text-3xl italic text-gold/80 sm:text-4xl">{v}</span>
          <span className="h-2 w-2 rotate-45 bg-gold/40" />
        </span>
      ))}
    </div>
  );

  return (
    <section className="overflow-hidden border-y border-gold/20 bg-ink-900 py-7" data-testid="values-marquee">
      <div className="flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
};

export default Marquee;
