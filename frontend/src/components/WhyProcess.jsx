import {
  Clock,
  Compass,
  Cpu,
  DoorOpen,
  FileUp,
  Globe,
  HandHeart,
  HeartHandshake,
  Lock,
  ReceiptText,
  RefreshCw,
  Scale,
  ShieldCheck,
  Timer,
  Video,
  CalendarPlus,
} from "lucide-react";
import { FadeUp, Eyebrow } from "@/components/Reveal";

const WHY = [
  { icon: Clock, label: "24×7 Availability", span: "" },
  { icon: DoorOpen, label: "Door-to-Door", span: "" },
  { icon: ReceiptText, label: "Transparent Pricing", span: "" },
  { icon: Globe, label: "PAN India & International", span: "sm:col-span-2" },
  { icon: Timer, label: "24-Hour Delivery", span: "" },
  { icon: ShieldCheck, label: "100% Refund Guarantee", span: "" },
  { icon: Scale, label: "Litigation Management", span: "" },
  { icon: Lock, label: "Confidentiality", span: "sm:col-span-2" },
  { icon: Cpu, label: "Technology-Enabled", span: "" },
  { icon: HandHeart, label: "Client-First", span: "" },
];

const STEPS = [
  { icon: CalendarPlus, title: "Book", desc: "Pay & schedule instantly, 24/7." },
  { icon: FileUp, title: "Share", desc: "Provide details & documents." },
  { icon: Video, title: "Consult", desc: "Meet online or offline." },
  { icon: Compass, title: "Strategy", desc: "A custom legal roadmap." },
  { icon: Scale, title: "Execution", desc: "Drafting & representation." },
  { icon: RefreshCw, title: "Support", desc: "Ongoing updates & care." },
];

export const WhyProcess = () => (
  <section className="bg-paper py-24 lg:py-32" data-testid="why-section">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <FadeUp>
            <Eyebrow>Why SpLegalMart?</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] text-ink sm:text-5xl">
              Built around the client,{" "}
              <span className="italic text-gold-600">every single time.</span>
            </h2>
          </FadeUp>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2" data-testid="why-grid">
            {WHY.map(({ icon: Icon, label, span }, i) => (
              <FadeUp key={label} delay={i * 0.05} className={span}>
                <div className="group flex h-full items-center gap-3 border border-ink/10 bg-white p-4 transition-colors duration-200 hover:border-gold/60">
                  <Icon className="h-5 w-5 shrink-0 text-gold-600 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-sm font-medium text-ink">{label}</span>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <FadeUp>
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] text-ink sm:text-5xl">
              Six steps from question{" "}
              <span className="italic text-gold-600">to resolution.</span>
            </h2>
          </FadeUp>
          <div className="mt-10 grid gap-px overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3" data-testid="process-grid">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <FadeUp key={title} delay={i * 0.07}>
                <div className="group relative h-full bg-white p-7 transition-colors duration-200 hover:bg-gold/5">
                  <span className="font-display text-4xl italic text-gold-600/50" data-testid="process-step-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-5 flex items-center gap-2 text-base font-semibold text-ink">
                    <Icon className="h-4 w-4 text-gold-600" /> {title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.2} className="mt-6 flex items-center gap-3 text-sm text-ink-600" data-testid="process-summary">
            <HeartHandshake className="h-4 w-4 shrink-0 text-gold-600" />
            Pay &amp; schedule · Provide details · Meet online/offline · Custom roadmap · Drafting/representation ·
            Ongoing updates.
          </FadeUp>
        </div>
      </div>
    </div>
  </section>
);

export default WhyProcess;
