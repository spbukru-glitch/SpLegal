import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Leaf, MessageCircle, Scale, Sprout, TreePine, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FadeUp, Eyebrow } from "@/components/Reveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const UPI = "7992461191@ybl";
const SKYDO = "8333555230";

const SHOWCASE = [
  { img: "/csr/greenmission.jpg", caption: "Green Mission — Tree Plantation · Life · Environment" },
  { img: "/csr/legalaid.jpg", caption: "Mass Legal Aid Drives — Access to Justice for All" },
  { img: "/csr/community.jpg", caption: "Community Meetings & Awareness — Stronger Community, Better Tomorrow" },
  { img: "/csr/roadmarch.jpg", caption: "Road Marches & Campaigns — Say No to Plastic, Say Yes to Nature" },
  { img: "/csr/conference.jpg", caption: "Conferences — Sustainable Development & Community Participation" },
];

const PILLARS = [
  { icon: TreePine, label: "Mass Tree Plantation Drives" },
  { icon: Users, label: "Conferences & Community Meetings" },
  { icon: Sprout, label: "Environment Exhibitions" },
  { icon: Leaf, label: "Awareness Campaigns & Road Marches" },
  { icon: Users, label: "Sponsor Sports for Youth" },
  { icon: Leaf, label: "Rural Students for a Green Future" },
  { icon: Scale, label: "Free Legal Aid Camps" },
  { icon: Scale, label: "Legal Literacy & Awareness Programmes" },
];

const MEDIA_TYPE_LABEL = { photo: "Photo", video: "Video", blog: "Blog", article: "Article", social: "Social" };

export default function CSRPage() {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    api
      .get("/csr/media")
      .then(({ data }) => setMedia(Array.isArray(data) ? data : []))
      .catch(() => setMedia([]));
  }, []);

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`, { description: value });
    } catch {
      toast.error(`Could not copy — ${label}: ${value}`);
    }
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink" data-testid="csr-page">
      {/* header */}
      <header className="sticky top-0 z-50 border-b border-gold/20 bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-3" data-testid="csr-logo-link">
            <img src="/brand/seal.png" alt="SpLegalMart emblem" className="h-11 w-11 rounded-full ring-1 ring-gold/60" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-semibold tracking-wide text-paper">SpLegalMart</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold">CSR · Green Mission</span>
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-paper/80 transition-colors hover:text-gold"
            data-testid="csr-back-link"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Website
          </a>
        </div>
      </header>

      {/* hero */}
      <section className="grain relative overflow-hidden bg-ink py-24 text-paper lg:py-28" data-testid="csr-hero">
        <div
          className="pointer-events-none absolute -top-32 right-[-10%] h-[60vh] w-[50vw] rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(74,160,44,0.18), rgba(74,160,44,0))" }}
          aria-hidden="true"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <Eyebrow dark>CSR — Corporate Social Responsibility</Eyebrow>
            <h1 className="mt-5 max-w-3xl font-display text-5xl font-medium leading-[1.03] sm:text-6xl lg:text-7xl">
              <span className="gold-text italic">Green Mission</span> &amp; Access to Justice for All.
            </h1>
            <p className="mt-5 font-display text-2xl italic text-gold/90" data-testid="csr-hindi-tagline">
              &ldquo;हरियाली बढ़ेगी, तो खुशहाली बढ़ेगी&rdquo; — एक पेड़, सैकड़ों जीवनों की आशा
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-paper/70 sm:text-lg" data-testid="csr-intro">
              Tree Plantation · Life · Environment — for a greener, cleaner and healthier tomorrow. Alongside free
              legal aid camps and legal literacy programmes, SpLegalMart runs the Green Mission: mass plantation
              drives, community conferences, awareness campaigns, road marches, environment exhibitions and sports
              sponsorship for rural youth.
            </p>
          </FadeUp>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="csr-pillars">
            {PILLARS.map(({ icon: Icon, label }, i) => (
              <FadeUp key={label} delay={i * 0.05}>
                <div className="flex h-full items-center gap-3 border border-gold/25 bg-ink-800/60 p-4">
                  <Icon className="h-4 w-4 shrink-0 text-gold" />
                  <span className="text-xs font-medium leading-snug text-paper/85">{label}</span>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* showcase posters */}
      <section className="py-20 lg:py-24" data-testid="csr-showcase-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <Eyebrow>Our Work on the Ground</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium text-ink sm:text-5xl">
              Field initiatives, <span className="italic text-gold-600">documented.</span>
            </h2>
          </FadeUp>
          <div className="mt-12 grid gap-8 sm:grid-cols-2" data-testid="csr-showcase">
            {SHOWCASE.map((s, i) => (
              <FadeUp key={s.img} delay={i * 0.06} className={i === 0 ? "sm:col-span-2" : ""}>
                <figure className="group">
                  <div className="relative">
                    <div className="absolute -left-2.5 -top-2.5 h-full w-full border border-gold/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" aria-hidden="true" />
                    <img
                      src={s.img}
                      alt={s.caption}
                      loading="lazy"
                      className="relative aspect-[3/2] w-full border border-ink/10 object-cover"
                      data-testid={`csr-showcase-img-${i}`}
                    />
                  </div>
                  <figcaption className="mt-3 text-sm font-medium text-ink-600" data-testid={`csr-showcase-caption-${i}`}>
                    {s.caption}
                  </figcaption>
                </figure>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* live media gallery */}
      <section className="grain relative bg-ink py-20 text-paper lg:py-24" data-testid="csr-gallery-section">
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <FadeUp>
            <Eyebrow dark>Latest from the Field</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium sm:text-5xl">
              Updates from our <span className="gold-text italic">CSR team.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-paper/60">
              Photos, videos, blogs, articles and social links published live by the SpLegalMart team.
            </p>
          </FadeUp>
          {media.length === 0 ? (
            <p className="mt-10 border border-dashed border-gold/30 p-8 text-sm text-paper/50" data-testid="csr-gallery-empty">
              New photos, videos, blogs, articles and social links will appear here as the team publishes them.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-testid="csr-gallery">
              {media.map((m) => (
                <div key={m._id} className="border border-gold/25 bg-ink-800/60 p-4" data-testid="csr-media-card">
                  {m.media_type === "photo" && m.storage_path ? (
                    <img
                      src={`${API}/csr/media/${m._id}/file`}
                      alt={m.title}
                      loading="lazy"
                      className="aspect-[4/3] w-full border border-ink/20 object-cover"
                    />
                  ) : (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 border border-gold/30 bg-ink-900/60 text-gold transition-colors hover:border-gold"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">
                        {MEDIA_TYPE_LABEL[m.media_type] || m.media_type}
                      </span>
                      <span className="px-6 text-center text-sm">Open link ↗</span>
                    </a>
                  )}
                  <p className="mt-3 text-sm font-semibold text-paper">{m.title}</p>
                  {m.caption && <p className="mt-1 text-xs leading-relaxed text-paper/60">{m.caption}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* support / donate */}
      <section className="py-20 lg:py-24" data-testid="csr-support-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <FadeUp>
              <Eyebrow>Support the Mission</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-medium text-ink sm:text-5xl">
                Scan &amp; donate for a <span className="italic text-gold-600">greener India.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-600" data-testid="csr-support-text">
                आपका छोटा सहयोग बड़ा परिवर्तन ला सकता है — your small contribution can bring big change. Every rupee
                goes into plantation drives, legal aid camps, awareness programmes and community sports.
              </p>
              <div className="mt-8 grid gap-3">
                <button
                  onClick={() => copy(UPI, "UPI ID")}
                  data-testid="csr-copy-upi"
                  className="group flex w-fit items-center gap-3 border border-gold/50 bg-white px-5 py-3 font-mono text-sm text-ink transition-colors duration-200 hover:border-gold"
                >
                  UPI: {UPI}
                  <Copy className="h-4 w-4 text-gold-600 opacity-60 transition-opacity group-hover:opacity-100" />
                </button>
                <button
                  onClick={() => copy(SKYDO, "Skydo account number")}
                  data-testid="csr-copy-skydo"
                  className="group flex w-fit items-center gap-3 border border-ink/20 bg-white px-5 py-3 font-mono text-sm text-ink transition-colors duration-200 hover:border-gold"
                >
                  Skydo A/c No. {SKYDO} · SPlegalmart (international)
                  <Copy className="h-4 w-4 text-gold-600 opacity-60 transition-opacity group-hover:opacity-100" />
                </button>
                <a
                  href={`https://wa.me/917992461191?text=${encodeURIComponent("I would like to support SpLegalMart's Green Mission.")}`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="csr-donate-whatsapp"
                  className="flex w-fit items-center gap-3 bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-paper transition-colors duration-200 hover:bg-ink-700"
                >
                  <MessageCircle className="h-4 w-4 text-gold" /> Coordinate on WhatsApp
                </a>
              </div>
            </FadeUp>
            <FadeUp delay={0.1} className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute -left-3 -top-3 h-full w-full border border-gold/40" aria-hidden="true" />
                <div className="relative bg-white p-5 shadow-xl" data-testid="csr-qr-frame">
                  <img src="/brand/upi-qr.png" alt="Scan to donate via UPI" className="h-52 w-52" data-testid="csr-qr-img" />
                  <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-600">
                    Scan &amp; Support
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* bottom bar */}
      <footer className="border-t border-gold/15 bg-ink-950 py-8 text-center text-xs text-paper/50" data-testid="csr-footer">
        <p>
          <a href="/" className="text-gold/80 transition-colors hover:text-gold" data-testid="csr-footer-home">
            SpLegalMart
          </a>{" "}
          · © 2026 All rights reserved · Your Rights. Our Responsibility. Secure &amp; Trusted.
        </p>
      </footer>
    </div>
  );
}
