import { Link } from "react-router-dom";
import { FAQSection } from "@/components/landing/FAQSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-raw-black">
      <header className="border-b border-raw-border/30 bg-raw-black/85 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-[0.2em] text-raw-text/85">
            ra<span className="text-raw-gold">W</span>
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-raw-border/40 bg-raw-black/35 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-raw-silver/75 transition hover:border-raw-gold/35 hover:text-raw-gold"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <FAQSection />

      <LandingFooter />
    </div>
  );
};

export default FAQ;
