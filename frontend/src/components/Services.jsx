import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, ScrollText } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { FadeUp, Eyebrow } from "@/components/Reveal";

const FALLBACK_SERVICES = [
  ["Initial Online Consultation (10 min)", "199", "Consultation"],
  ["Detailed Online Consultation (30 min)", "499", "Consultation"],
  ["Detailed Online Consultation (1 hr) / Office consultation", "999", "Consultation"],
  ["Drafting / Vetting (up to 3 pages)", "999", "Drafting & Vetting"],
  ["Drafting / Vetting (3-10 pages)", "4,999", "Drafting & Vetting"],
  ["Drafting / Vetting (over 10 pages)", "9,999", "Drafting & Vetting"],
  ["Complete Case Management (Annually)", "9,999", "Case Management"],
  ["Complete Case Management (One Time)", "49,999", "Case Management"],
  ["Corporate Retainer (Monthly)", "4,999", "Case Management"],
  ["Corporate Legal Audit / Property Document Vetting (up to 5p)", "999", "Corporate & Audit"],
  ["Property Document Vetting (over 5p) / Legal Audit", "4,999 / 9,999", "Corporate & Audit"],
  ["Government Liaisoning (Annually)", "9,999", "Government & Liaison"],
  ["EPC, JV, Commercial Contracts", "0.5% of project cost", "Corporate & Audit"],
  ["Employment Disputes (Annually / One Time)", "9,999 / 49,999", "Litigation"],
  ["International Dispute Resolution", "1% of cost", "Global"],
  ["IP Protection (Annually) / Corporate Legal Training", "9,999 / 4,999", "Intellectual Property"],
  ["Arbitration & Mediation (Annually / One Time)", "9,999 / 49,999", "Litigation"],
  ["Domestic Enquiry / Investigation", "9,999", "Litigation"],
  ["Custom/GST/Income Tax/EPF/ESI/Labour (per filing)", "499", "Compliance & Tax"],
  ["Criminal/Family/Property/Civil (Annually / One Time)", "9,999 / 49,999", "Litigation"],
  ["Factory Establishment & Compliance", "1% of project cost", "Compliance & Tax"],
  ["Land Verification, Acquisition & Registration", "0.5% of cost", "Property"],
  ["Company Registration & MCA Compliance", "1,999", "Compliance & Tax"],
  ["Court Representation (District, HC, Tribunals)", "999", "Representation"],
  ["Government Tender & Contract Assistance", "0.5% of cost", "Government & Liaison"],
  ["Door-to-Door Service (per visit)", "999 + travel", "Representation"],
].map(([name, fee, category], i) => ({ id: `fallback-${i}`, name, fee, category, order: i + 1 }));

export const Services = () => {
  const [services, setServices] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => Array.isArray(data) && data.length && setServices(data))
      .catch(() => toast.error(formatApiError("Could not load live pricing — showing standard price list.")));
  }, []);

  const groups = [];
  services.forEach((s) => {
    const last = groups[groups.length - 1];
    if (last && last.category === s.category) last.items.push(s);
    else groups.push({ category: s.category, items: [s] });
  });

  let index = 0;

  return (
    <section id="services" className="bg-paper pb-24 pt-4 lg:pb-32" data-testid="services-section">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <FadeUp className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Our Services</Eyebrow>
            <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700" data-testid="services-live-badge">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live pricing · managed from admin panel
            </p>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Comprehensive <span className="italic text-gold-600">Legal Solutions</span>
            </h2>
            <p className="mt-4 max-w-lg text-base text-ink-600">
              End-to-end legal services under one roof — transparent &amp; fair.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-2 bg-gold/10 px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-gold/40"
            data-testid="services-price-badge"
          >
            <BadgeCheck className="h-4 w-4 text-gold-600" />
            Starts only ₹199 for PAN India · $5 for Global
          </span>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-12">
          <div className="overflow-x-auto" data-testid="services-table-wrap">
            <table className="w-full min-w-[640px] border-collapse text-left" data-testid="services-table">
              <thead>
                <tr className="bg-ink text-paper">
                  <th className="w-16 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">No.</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Service</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.18em]">
                    Fee (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <Fragment key={g.category}>
                    <tr>
                      <td colSpan={3} className="bg-gold/10 px-5 py-2.5">
                        <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-700">
                          <ScrollText className="h-3.5 w-3.5" /> {g.category}
                        </span>
                      </td>
                    </tr>
                    {g.items.map((s) => {
                      index += 1;
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-ink/5 transition-colors duration-200 hover:bg-gold/5"
                          data-testid="service-row"
                        >
                          <td className="px-5 py-4 font-display text-lg italic text-ink/40">
                            {String(index).padStart(2, "0")}
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-ink" data-testid="service-name">
                            {s.name}
                          </td>
                          <td
                            className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-ink"
                            data-testid="service-fee"
                          >
                            <span className="border-b-2 border-gold/60 pb-0.5">{s.fee}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm italic text-ink-600" data-testid="services-footnote">
            <span>No hidden charges. 100% transparency. Travel &amp; court misc. extra.</span>
            <span className="not-italic text-xs uppercase tracking-[0.18em] text-gold-700">Fair &amp; transparent</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default Services;
