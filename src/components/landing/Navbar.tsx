import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import { track } from "@/lib/analytics";

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onSignupClick: () => void;
}

export function Navbar({ isLoggedIn, username, onSignupClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignupClick = () => {
    track("landing_cta_clicked", {
      cta_id: "navbar_join_free",
      cta_text: "Join Free",
      source_section: "navbar",
    });
    setMenuOpen(false);
    onSignupClick();
  };

  const navLinks = [
    { href: "#communities", label: "Communities" },
    { href: "#polls", label: "Polls" },
    { href: "#avatar", label: "Avatar" },
  ];

  return (
    <nav className="landing-navbar fixed top-0 left-0 right-0 z-50 border-b border-raw-border/50 bg-raw-black/80 backdrop-blur-xl">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-10">
        <a href="#" className="font-display text-xl tracking-[0.3em] text-raw-text">
          ra<span className="text-raw-gold">W</span>
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-raw-silver/60 transition-colors hover:text-raw-silver"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-raw-gold/30 to-raw-gold/10 flex items-center justify-center">
                <span className="text-xs font-medium text-raw-gold">{username?.[0]?.toUpperCase()}</span>
              </div>
              <span className="hidden text-sm text-raw-silver/80 sm:inline">{username}</span>
            </div>
          ) : (
            <>
              <ThemeCustomizer placement="inline" className="shrink-0" />
              <button
                onClick={handleSignupClick}
                className="rounded-full bg-raw-gold px-4 py-2 text-sm font-semibold text-raw-black transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20 sm:px-5"
              >
                Join Free
              </button>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-raw-border/40 text-raw-silver/60 transition-colors hover:text-raw-text md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t border-raw-border/30 bg-raw-black/95 px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm text-raw-silver/70 transition-colors hover:text-raw-text"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
