import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import {
  Bell,
  Check,
  CircleDollarSign,
  FileText,
  LogOut,
  Moon,
  Palette,
  Settings,
  Shield,
  Sun,
  Trophy,
  User,
} from "lucide-react";
import { AvatarFigure } from "@/components/ui/avatar-figure";
import { cn } from "@/lib/utils";
import { type AccentPresetId, type ThemeMode, useTheme } from "@/providers/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DashboardTab = "home" | "polls" | "challenges" | "daily-spin" | "communities" | "profile" | "wallet";

interface DashboardNavProps {
  username: string;
  avatarLevel: number;
  showAdminLink?: boolean;
  onProfileClick: () => void;
  onLogout: () => void;
}

export function DashboardNav({ username, avatarLevel, showAdminLink = false, onProfileClick, onLogout }: DashboardNavProps) {
  const { mode, accent, accentPresets, setMode, setAccent } = useTheme();
  const [hoveredMode, setHoveredMode] = useState<ThemeMode | null>(null);
  const [hoveredAccent, setHoveredAccent] = useState<AccentPresetId | null>(null);
  const effectiveMode = hoveredMode ?? mode;
  const effectiveAccent = hoveredAccent ?? accent;
  const isEffectiveLight = effectiveMode === "light";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const selectedAccent = accentPresets.find((preset) => preset.id === effectiveAccent) ?? accentPresets[0];

    root.classList.toggle("theme-light", effectiveMode === "light");
    root.dataset.themeMode = effectiveMode;
    root.dataset.themeAccent = effectiveAccent;
    root.style.setProperty("--raw-accent", selectedAccent.rgb);
    root.style.setProperty("--raw-accent-shadow", selectedAccent.shadowRgb);
    root.style.setProperty("--primary", selectedAccent.hsl);
    root.style.setProperty("--accent", selectedAccent.hsl);
    root.style.setProperty("--ring", selectedAccent.hsl);
    root.style.setProperty("--sidebar-primary", selectedAccent.hsl);
    root.style.setProperty("--sidebar-ring", selectedAccent.hsl);
  }, [accent, accentPresets, hoveredAccent, hoveredMode, mode]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-raw-border/50 bg-raw-black/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <a href="/" className="font-display text-lg tracking-[0.3em] text-raw-text shrink-0">
          ra<span className="text-raw-gold">W</span>
        </a>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="relative text-raw-silver/40 hover:text-raw-silver/70 transition-colors">
            <Bell className="h-[18px] w-[18px]" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-raw-gold" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2.5 rounded-full border p-0.5 transition-colors",
                  isEffectiveLight
                    ? "border-raw-border/50 bg-white/75 hover:border-raw-gold/35"
                    : "border-raw-border/40 bg-raw-surface/35 hover:border-raw-gold/35",
                )}
                aria-label="Open profile menu"
              >
                <AvatarFigure level={avatarLevel} size="sm" selected />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className={cn(
                "w-[285px] max-w-[calc(100vw-1rem)] rounded-2xl p-2 text-raw-text",
                isEffectiveLight
                  ? "border border-slate-300/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.97),rgba(242,247,255,0.96))] shadow-[0_20px_50px_rgba(28,38,58,0.18)]"
                  : "border border-raw-border/40 bg-[linear-gradient(160deg,rgba(17,17,17,0.96),rgba(9,9,9,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.55)]",
              )}
            >
              <button
                onClick={onProfileClick}
                className={cn(
                  "mb-1 flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors",
                  isEffectiveLight
                    ? "border-raw-gold/25 bg-raw-gold/[0.12] hover:bg-raw-gold/[0.2]"
                    : "border-raw-gold/20 bg-raw-gold/[0.08] hover:bg-raw-gold/[0.12]",
                )}
              >
                <AvatarFigure level={avatarLevel} size="sm" selected />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-raw-text">View Profile</p>
                  <p className={cn("truncate text-xs", isEffectiveLight ? "text-slate-600" : "text-raw-silver/50")}>@{username}</p>
                </div>
              </button>

              <DropdownMenuItem onClick={onProfileClick} className={cn("rounded-lg px-3 py-2.5 text-sm focus:text-raw-text", isEffectiveLight ? "text-slate-700 focus:bg-slate-100" : "text-raw-silver/80 focus:bg-raw-surface/80")}>
                <User className="mr-3 h-4 w-4" />
                Edit Avatar
              </DropdownMenuItem>
              <DropdownMenuItem className={cn("rounded-lg px-3 py-2.5 text-sm focus:text-raw-text", isEffectiveLight ? "text-slate-700 focus:bg-slate-100" : "text-raw-silver/80 focus:bg-raw-surface/80")}>
                <FileText className="mr-3 h-4 w-4" />
                Drafts
              </DropdownMenuItem>
              <DropdownMenuItem className={cn("rounded-lg px-3 py-2.5 text-sm focus:text-raw-text", isEffectiveLight ? "text-slate-700 focus:bg-slate-100" : "text-raw-silver/80 focus:bg-raw-surface/80")}>
                <Trophy className="mr-3 h-4 w-4" />
                Achievements
              </DropdownMenuItem>
              <DropdownMenuItem className={cn("rounded-lg px-3 py-2.5 text-sm focus:text-raw-text", isEffectiveLight ? "text-slate-700 focus:bg-slate-100" : "text-raw-silver/80 focus:bg-raw-surface/80")}>
                <CircleDollarSign className="mr-3 h-4 w-4" />
                Earn
              </DropdownMenuItem>

              <DropdownMenuSeparator className={cn("my-2", isEffectiveLight ? "bg-slate-200" : "bg-raw-border/30")} />

              {showAdminLink ? (
                <DropdownMenuItem asChild className={cn("rounded-lg px-3 py-2.5 text-sm focus:text-raw-text", isEffectiveLight ? "text-slate-700 focus:bg-slate-100" : "text-raw-silver/80 focus:bg-raw-surface/80")}>
                  <a href="/admin">
                    <Shield className="mr-3 h-4 w-4" />
                    Admin
                  </a>
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={cn("rounded-lg px-3 py-2.5 text-sm focus:text-raw-text data-[state=open]:text-raw-text", isEffectiveLight ? "text-slate-700 focus:bg-slate-100 data-[state=open]:bg-slate-100" : "text-raw-silver/80 focus:bg-raw-surface/80 data-[state=open]:bg-raw-surface/80")}>
                  <Settings className="mr-3 h-4 w-4" />
                  Display Mode
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  className={cn(
                    "w-[300px] max-w-[calc(100vw-1rem)] rounded-2xl p-3 text-raw-text",
                    isEffectiveLight
                      ? "border border-slate-300/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(245,249,255,0.98))] shadow-[0_20px_50px_rgba(28,38,58,0.2)]"
                      : "border border-raw-border/35 bg-[linear-gradient(160deg,rgba(16,16,16,0.98),rgba(8,8,8,0.98))] shadow-[0_20px_50px_rgba(0,0,0,0.55)]",
                  )}
                >
                  <div className={cn("rounded-xl border p-3", isEffectiveLight ? "border-slate-200 bg-white/85" : "border-raw-border/30 bg-raw-surface/25")}>
                    <div className={cn("mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em]", isEffectiveLight ? "text-slate-500" : "text-raw-silver/45")}>
                      <Palette className="h-3.5 w-3.5" />
                      Theme Studio
                    </div>

                    <div className={cn("flex items-center gap-2 rounded-lg border p-1", isEffectiveLight ? "border-slate-200 bg-slate-50" : "border-raw-border/25 bg-raw-black/25")}>
                      <button
                        onMouseEnter={() => setHoveredMode("dark")}
                        onMouseLeave={() => setHoveredMode(null)}
                        onClick={() => {
                          setMode("dark");
                          setHoveredMode(null);
                        }}
                        className={cn(
                          "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                          !isEffectiveLight
                            ? "bg-raw-gold/15 text-raw-gold"
                            : "text-slate-500 hover:text-slate-900",
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Moon className="h-3.5 w-3.5" />
                          Dark
                        </span>
                      </button>
                      <button
                        onMouseEnter={() => setHoveredMode("light")}
                        onMouseLeave={() => setHoveredMode(null)}
                        onClick={() => {
                          setMode("light");
                          setHoveredMode(null);
                        }}
                        className={cn(
                          "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                          isEffectiveLight
                            ? "bg-raw-gold/15 text-raw-gold"
                            : "text-raw-silver/60 hover:text-raw-text",
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Sun className="h-3.5 w-3.5" />
                          Light
                        </span>
                      </button>
                    </div>

                    <div className="mt-4">
                      <p className={cn("mb-2 text-[10px] uppercase tracking-[0.16em]", isEffectiveLight ? "text-slate-500" : "text-raw-silver/45")}>Accent</p>
                      <div className="grid grid-cols-5 gap-2">
                        {accentPresets.map((preset) => {
                          const selected = preset.id === effectiveAccent;

                          return (
                            <button
                              key={preset.id}
                              onMouseEnter={() => setHoveredAccent(preset.id)}
                              onMouseLeave={() => setHoveredAccent(null)}
                              onClick={() => {
                                setAccent(preset.id);
                                setHoveredAccent(null);
                              }}
                              className={cn(
                                "relative h-9 rounded-lg border transition-all",
                                selected
                                  ? "border-raw-text shadow-[0_0_0_1px_rgb(var(--raw-text)/0.3)]"
                                  : "border-raw-border/35 hover:border-raw-silver/35",
                              )}
                              style={{ backgroundColor: `rgb(${preset.rgb})` }}
                              aria-label={`Use ${preset.label} accent`}
                              title={preset.label}
                            >
                              {selected ? <Check className="mx-auto h-3.5 w-3.5 text-raw-ink" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator className={cn("my-2", isEffectiveLight ? "bg-slate-200" : "bg-raw-border/30")} />

              <DropdownMenuItem
                onClick={() => {
                  track("logout_clicked", {});
                  onLogout();
                }}
                className={cn("rounded-lg px-3 py-2.5 text-sm focus:bg-red-500/15 focus:text-red-200", isEffectiveLight ? "text-slate-700" : "text-raw-silver/80")}
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
