import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string;
  onSignupClick: () => void;
}

export function Navbar({ isLoggedIn, username, onSignupClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-raw-border/50 bg-raw-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#" className="font-display text-lg tracking-[0.24em] text-raw-text sm:text-xl sm:tracking-[0.3em]">
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
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-raw-gold/30 to-raw-gold/10 flex items-center justify-center">
              <span className="text-xs font-medium text-raw-gold">{username?.[0]?.toUpperCase()}</span>
            </div>
            <span className="max-w-[110px] truncate text-sm text-raw-silver/80 sm:max-w-[180px]">{username}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeCustomizer placement="inline" />
            <button
              onClick={onSignupClick}
              className="rounded-full bg-raw-gold px-4 py-2 text-xs font-semibold text-raw-ink transition-all hover:bg-raw-gold/90 hover:shadow-lg hover:shadow-raw-gold/20 sm:px-5 sm:text-sm"
            >
              Join Free
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-raw-border/30 px-4 pb-2 pt-2 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto text-xs text-raw-silver/70 no-visible-scrollbar">
          <a href="#communities" className="whitespace-nowrap transition-colors hover:text-raw-silver">Communities</a>
          <a href="#polls" className="whitespace-nowrap transition-colors hover:text-raw-silver">Polls</a>
          <a href="#avatar" className="whitespace-nowrap transition-colors hover:text-raw-silver">Avatar</a>
        </div>
      </div>
    </nav>
  );
}
