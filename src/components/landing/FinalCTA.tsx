import { FormEvent, useState } from "react";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { MinimalFooter } from "@/components/ui/minimal-footer";

interface FinalCTAProps {
  onSignupClick: () => void;
}

export function FinalCTA({ onSignupClick }: FinalCTAProps) {
  const supportWhatsAppNumber = import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER ?? "+201000000000";
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL ?? "support@theartofraw.me";
  const whatsAppHref = `https://wa.me/${supportWhatsAppNumber.replace(/\D/g, "")}`;

  const [ownerName, setOwnerName] = useState("");
  const [communityName, setCommunityName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEarlyAccessSubmit = (event: FormEvent) => {
    event.preventDefault();

    const trimmedOwnerName = ownerName.trim();
    const trimmedCommunityName = communityName.trim();
    const trimmedContactEmail = contactEmail.trim();

    if (!trimmedOwnerName || !trimmedCommunityName || !trimmedContactEmail) {
      setErrorMessage("Please complete all fields.");
      setSuccessMessage("");
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContactEmail);
    if (!isEmailValid) {
      setErrorMessage("Please enter a valid email address.");
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("You're in. We'll contact you with early access details soon.");
    setOwnerName("");
    setCommunityName("");
    setContactEmail("");
  };

  return (
    <section className="relative px-4 py-24 sm:px-6 sm:py-28 md:py-32">
      {/* Subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-raw-gold/[0.04] blur-[100px]" />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="font-display text-2xl tracking-wide text-raw-text sm:text-3xl md:text-4xl">
          Join the Community Owner Early Access
        </h2>
        <div className="mt-4 flex items-center justify-center">
          <ContainerTextFlip
            words={["launch-ready", "trusted", "member-led", "raW"]}
            interval={2500}
            className="!text-3xl sm:!text-4xl"
          />
        </div>
        <p className="mx-auto mt-6 max-w-lg text-sm text-raw-silver/65 sm:text-base sm:text-raw-silver/50">
          Fill out this form to request early access as a community owner. We will follow up with next steps.
        </p>

        <form onSubmit={handleEarlyAccessSubmit} className="mx-auto mt-8 max-w-xl rounded-2xl border border-raw-border/50 bg-raw-surface/70 p-4 text-left backdrop-blur-sm sm:mt-10 sm:p-6">
          <div className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-raw-silver/45">Your name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                placeholder="Alex Rivera"
                maxLength={60}
                className="w-full rounded-xl border border-raw-border bg-raw-black/50 px-4 py-3 text-sm text-raw-text placeholder:text-raw-silver/25 transition-all focus:border-raw-gold/30 focus:outline-none focus:ring-1 focus:ring-raw-gold/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-raw-silver/45">Community name</label>
              <input
                type="text"
                value={communityName}
                onChange={(event) => setCommunityName(event.target.value)}
                placeholder="Founders Circle"
                maxLength={80}
                className="w-full rounded-xl border border-raw-border bg-raw-black/50 px-4 py-3 text-sm text-raw-text placeholder:text-raw-silver/25 transition-all focus:border-raw-gold/30 focus:outline-none focus:ring-1 focus:ring-raw-gold/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-raw-silver/45">Contact email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="owner@community.com"
                maxLength={120}
                className="w-full rounded-xl border border-raw-border bg-raw-black/50 px-4 py-3 text-sm text-raw-text placeholder:text-raw-silver/25 transition-all focus:border-raw-gold/30 focus:outline-none focus:ring-1 focus:ring-raw-gold/20"
              />
            </div>

            {errorMessage && (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 rounded-full bg-raw-gold px-8 py-3.5 text-sm font-bold text-raw-ink transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20"
            >
              Request early access
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <button
            onClick={onSignupClick}
            className="rounded-full border border-raw-border px-8 py-3.5 text-sm font-medium text-raw-silver/80 transition-all hover:border-raw-silver/30 hover:text-raw-text"
          >
            Or create an anonymous account
          </button>
          <a
            href="#communities"
            className="rounded-full border border-raw-border px-8 py-3.5 text-center text-sm font-medium text-raw-silver/80 transition-all hover:border-raw-silver/30 hover:text-raw-text"
          >
            Explore communities
          </a>
        </div>

        <p className="mt-5 text-xs text-raw-silver/50">We only use this info for early-access onboarding.</p>
      </div>

      <div className="mt-20 sm:mt-24 md:mt-28">
        <div className="mx-auto mb-8 flex max-w-6xl flex-col items-center justify-center gap-2 text-center text-sm text-raw-silver/65">
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-raw-text"
          >
            WhatsApp: {supportWhatsAppNumber}
          </a>
          <a
            href={`mailto:${supportEmail}`}
            className="transition-colors hover:text-raw-text"
          >
            Email: {supportEmail}
          </a>
          <span className="text-xs text-raw-silver/35">theartofraw.me</span>
        </div>

        <MinimalFooter />
      </div>
    </section>
  );
}
