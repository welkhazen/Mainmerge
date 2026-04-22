import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { track } from "@/lib/analytics";

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onSignupClick: () => void;
}

export function Navbar({ isLoggedIn, username, onSignupClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignupClick = () => {
    track("landing_cta_clicked", {
      cta_id: "navbar_join_free",
      cta_text: "Join Free",
      source_section: "navbar",
    });
    setMobileMenuOpen(false);
    onSignupClick();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <nav className="landing-navbar fixed top-0 left-0 right-0 z-50 border-b border-raw-border/50 bg-raw-black/80 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10">
        <a href="#" className="font-display text-lg tracking-[0.3em] text-raw-text sm:text-xl">
          ra<span className="text-raw-gold">W</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#communities" className="text-sm text-raw-silver/60 transition-colors hover:text-raw-silver">
            Communities
          </a>
          <a href="#polls" className="text-sm text-raw-silver/60 transition-colors hover:text-raw-silver">
            Polls
          </a>
          <a href="#avatar" className="text-sm text-raw-silver/60 transition-colors hover:text-raw-silver">
            Avatar
          </a>
        </div>

        {isLoggedIn ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-raw-gold/30 to-raw-gold/10">
              <span className="text-xs font-medium text-raw-gold">{username?.[0]?.toUpperCase()}</span>
            </div>
            <span className="hidden text-sm text-raw-silver/80 sm:inline">{username}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeCustomizer placement="inline" className="shrink-0" />
            <button
              onClick={handleSignupClick}
              className="hidden rounded-full bg-raw-gold px-5 py-2 text-sm font-semibold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20 sm:inline-flex"
            >
              Join Free
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-raw-border/50 text-raw-silver/80 transition-colors hover:text-raw-text md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>

      {mobileMenuOpen && !isLoggedIn ? (
        <div
          id="landing-mobile-menu"
          className="md:hidden border-t border-raw-border/40 bg-raw-black/95 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-1 px-4 py-4">
            <a
              href="#communities"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-base text-raw-silver/80 transition-colors hover:bg-raw-surface/40 hover:text-raw-text"
            >
              Communities
            </a>
            <a
              href="#polls"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-base text-raw-silver/80 transition-colors hover:bg-raw-surface/40 hover:text-raw-text"
            >
              Polls
            </a>
            <a
              href="#avatar"
              onClick={closeMobileMenu}
              className="rounded-xl px-4 py-3 text-base text-raw-silver/80 transition-colors hover:bg-raw-surface/40 hover:text-raw-text"
            >
              Avatar
            </a>
            <button
              type="button"
              onClick={handleSignupClick}
              className="mt-2 w-full rounded-full bg-raw-gold px-5 py-3 text-sm font-semibold text-raw-black transition-all hover:bg-raw-gold/90"
            >
              Join Free
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
