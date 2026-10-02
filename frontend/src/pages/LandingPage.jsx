import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import WhyProcess from "@/components/WhyProcess";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";

export default function LandingPage() {
  return (
    <div className="bg-paper font-sans text-ink" data-testid="landing-page">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Booking />
        <WhyProcess />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
