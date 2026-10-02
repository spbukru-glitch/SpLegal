import { Eye, Scale } from "lucide-react";
import { FadeUp, Eyebrow } from "@/components/Reveal";

const EXPERTISE = [
  {
    n: "01",
    title: "Litigation Support & Management",
    body: "Criminal, ED, CBI & economic disputes · Civil, property, land, family & matrimonial matters · Industrial, service, labour & employment disputes · Banking & SARFAESI, real estate & RERA, corporate & commercial, merger & acquisition, land acquisition · Intellectual property rights — registration & protection of trademarks, copyrights and patents · Global workforce, employment & mobility contracts and immigration disputes, and more.",
  },
  {
    n: "02",
    title: "Para-Legal Services",
    body: "Legal research · Multi-dimensional drafting, review & vetting of pleadings, agreements, contracts and petitions · Case preparation & e-filing · e-discovery · Investigation, domestic enquiry & fact-finding · Title search, vetting, registration and conversion of land · Audit & risk analysis · Documentation & trial preparation · Business formation due diligence · Data privacy · Tort & personal injury · Transcription of legal records · DMCA & OTT due diligence · IP portfolio management · Custom, GST, EPF, ESI, Labour, MCA & Income Tax compliance · Global regulatory compliance — GDPR, CCPA, AML and industry-specific certifications · Statutory registration, licensing, renewal, approval, consent, NOC, and more.",
  },
  {
    n: "03",
    title: "Regulatory & Advisory",
    body: "Management & monitoring of regulatory approval of turnkey work contracts & EPC of new projects · Government and public authority liaison, representation & coordination · Corporate legal training, and more.",
  },
];

export const About = () => (
  <section id="about" className="bg-paper py-24 lg:py-32" data-testid="about-section">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <FadeUp>
              <Eyebrow>About Us — Who We Are</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
                Protecting your rights,{" "}
                <span className="italic text-gold-600">across borders.</span>
              </h2>
              <p className="mt-7 max-w-md text-base leading-relaxed text-ink-600" data-testid="about-intro">
                SP Legal Mart is a premium internationally recognised integrated cost-efficient platform for global
                legal and para-legal services under one roof, with justice and professional commitment. Every legal
                matter is unique — we combine legal expertise, research, and strategic planning to protect your rights
                across borders. We serve PAN India &amp; globally, 24/7, for multinational corporations, individuals,
                attorneys, companies, startups, NGOs, MSMEs, e-commerce &amp; enterprises — situated anywhere in the
                world.
              </p>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                <div className="border-l-2 border-gold bg-white p-6" data-testid="about-mission">
                  <Eye className="h-5 w-5 text-gold-600" />
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink">Mission</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    Accessible, affordable, professional legal solutions globally.
                  </p>
                </div>
                <div className="border-l-2 border-ink bg-white p-6" data-testid="about-vision">
                  <Scale className="h-5 w-5 text-gold-600" />
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink">Vision</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">
                    Exceptional client service, integrity, transparency, and excellence on a national and
                    international scale.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>

        <div className="lg:col-span-7">
          <FadeUp className="relative">
            <div className="absolute -left-3 -top-3 h-full w-full border border-gold/40" aria-hidden="true" />
            <img
              src="https://images.unsplash.com/photo-1768839722927-df0ef3188f6d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHw0fHxsZWdhbCUyMHNjYWxlcyUyMGRhcmt8ZW58MHx8fDE3OTA5Mjg1NzR8MA&ixlib=rb-4.1.0&q=85"
              alt="Scales of justice"
              className="relative aspect-[16/9] w-full object-cover"
              data-testid="about-image"
            />
          </FadeUp>

          <div className="mt-14">
            {EXPERTISE.map((e, i) => (
              <FadeUp key={e.n} delay={i * 0.08}>
                <div className="group grid gap-4 border-t border-ink/10 py-8 sm:grid-cols-[64px_1fr] sm:gap-8" data-testid="expertise-row">
                  <span className="font-display text-4xl italic text-gold-600/70 transition-colors duration-300 group-hover:text-gold-600">
                    {e.n}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{e.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{e.body}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
            <div className="border-t border-ink/10" />
            <FadeUp delay={0.1} className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink">Core Values</span>
              {["Integrity", "Excellence", "Confidentiality", "Client-Centric", "Accountability"].map((v) => (
                <span
                  key={v}
                  className="border border-gold/40 bg-white px-4 py-1.5 text-xs font-medium text-ink-700"
                  data-testid="core-value-chip"
                >
                  {v}
                </span>
              ))}
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default About;
