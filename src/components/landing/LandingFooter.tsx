import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Twitter, MessageCircle } from "lucide-react";

export function LandingFooter() {
  const supportWhatsAppNumber = import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER ?? "+201000000000";
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL ?? "support@theartofraw.me";
  const whatsAppHref = `https://wa.me/${supportWhatsAppNumber.replace(/\D/g, "")}`;

  return (
    <section className="pt-16 sm:pt-20 bg-raw-black relative z-10">
      <div className="border-t border-raw-border/20 bg-raw-black px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:grid-cols-5 mb-12">
            {/* Product */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-raw-gold/75">Product</p>
              <ul className="mt-4 space-y-2">
                <li><a href="/ask" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Ask AI</a></li>
                <li><a href="/faq" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">FAQ</a></li>
                <li><a href="/#polls" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Polls</a></li>
                <li><a href="/#communities" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Communities</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-raw-gold/75">Legal</p>
              <ul className="mt-4 space-y-2">
                <li><a href="/terms" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Terms</a></li>
                <li><a href="/privacy" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Privacy</a></li>
                <li><a href="/security" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Security</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-raw-gold/75">Contact</p>
              <ul className="mt-4 space-y-2">
                <li><a href={`mailto:${supportEmail}`} className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Email</a></li>
                <li><a href={whatsAppHref} className="text-sm text-raw-silver/60 hover:text-raw-gold transition">WhatsApp</a></li>
                <li><a href="mailto:hello@theartofraw.me" className="text-sm text-raw-silver/60 hover:text-raw-gold transition">Support</a></li>
              </ul>
            </div>

            {/* Social */}
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-raw-gold/75">Follow</p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://twitter.com/theartofraw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-raw-border/40 bg-raw-black/40 p-2 text-raw-silver/60 hover:border-raw-gold/40 hover:text-raw-gold transition"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://discord.gg/theartofraw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-raw-border/40 bg-raw-black/40 p-2 text-raw-silver/60 hover:border-raw-gold/40 hover:text-raw-gold transition"
                  aria-label="Discord"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-raw-border/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-raw-silver/40">
              © 2026 raW (the raw). All rights reserved.
            </p>
            <p className="text-xs text-raw-silver/40">
              Built for authentic conversations. No algorithms. No judgment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}