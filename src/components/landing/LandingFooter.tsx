import { MinimalFooter } from "@/components/ui/minimal-footer";

export function LandingFooter() {
  const supportWhatsAppNumber = import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER ?? "+201000000000";
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL ?? "support@theartofraw.me";
  const whatsAppHref = `https://wa.me/${supportWhatsAppNumber.replace(/\D/g, "")}`;

  return (
    <section className="pt-16 sm:pt-20">
      <MinimalFooter
        edgeToScreen
        leftLinks={[
          { title: "WhatsApp", href: whatsAppHref },
          { title: "Email", href: `mailto:${supportEmail}` },
        ]}
      />
    </section>
  );
}