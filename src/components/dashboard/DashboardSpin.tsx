import { useState } from "react";
import { WheelOfFortune, type WheelPrize } from "@/components/wheel/WheelOfFortune";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gift, Sparkles, Star, Zap, Clock } from "lucide-react";

const PRIZES: WheelPrize[] = [
  { id: "xp-50", label: "50 XP", shortLabel: "50 XP", color: "#121212", textColor: "#D9D9D9" },
  { id: "try-1", label: "Try Again", shortLabel: "TRY AGAIN", color: "#0e0e0e", textColor: "#666" },
  { id: "xp-100", label: "100 XP", shortLabel: "100 XP", color: "#121212", textColor: "#F1C42D" },
  { id: "streak", label: "Streak Shield", shortLabel: "SHIELD", color: "#0e0e0e", textColor: "#D9D9D9" },
  { id: "xp-200", label: "200 XP", shortLabel: "200 XP", color: "#121212", textColor: "#F1C42D" },
  { id: "try-2", label: "Try Again", shortLabel: "TRY AGAIN", color: "#0e0e0e", textColor: "#666" },
  { id: "theme", label: "Avatar Theme", shortLabel: "THEME", color: "#1a1508", textColor: "#F1C42D" },
  { id: "xp-50b", label: "50 XP", shortLabel: "50 XP", color: "#0e0e0e", textColor: "#D9D9D9" },
  { id: "try-3", label: "Try Again", shortLabel: "TRY AGAIN", color: "#121212", textColor: "#666" },
  { id: "xp-500", label: "500 XP Jackpot!", shortLabel: "500 XP", color: "#1a1508", textColor: "#F1C42D" },
  { id: "badge", label: "Community Badge", shortLabel: "BADGE", color: "#121212", textColor: "#D9D9D9" },
  { id: "xp-100b", label: "100 XP", shortLabel: "100 XP", color: "#0e0e0e", textColor: "#F1C42D" },
];

const prizeMessages: Record<string, { title: string; desc: string; icon: typeof Gift }> = {
  "xp-50": { title: "50 XP Earned!", desc: "Every bit counts on your journey.", icon: Zap },
  "xp-50b": { title: "50 XP Earned!", desc: "Every bit counts on your journey.", icon: Zap },
  "xp-100": { title: "100 XP Earned!", desc: "Solid spin! Your avatar grows stronger.", icon: Star },
  "xp-100b": { title: "100 XP Earned!", desc: "Solid spin! Your avatar grows stronger.", icon: Star },
  "xp-200": { title: "200 XP Earned!", desc: "Big win! You're leveling up fast.", icon: Sparkles },
  "xp-500": { title: "500 XP Jackpot!", desc: "Incredible! The wheel favors the bold.", icon: Gift },
  "streak": { title: "Streak Shield!", desc: "Your streak is protected for one missed day.", icon: Sparkles },
  "theme": { title: "Avatar Theme Unlocked!", desc: "A new look awaits you in the Marketplace.", icon: Gift },
  "badge": { title: "Community Badge!", desc: "Show it off in your communities.", icon: Star },
  "try-1": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock },
  "try-2": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock },
  "try-3": { title: "Not This Time", desc: "The wheel will turn again tomorrow.", icon: Clock },
};

interface DashboardSpinProps {
  hasSpunToday: boolean;
  onSpin: () => void;
}

export function DashboardSpin({ hasSpunToday, onSpin }: DashboardSpinProps) {
  const [prizeModal, setPrizeModal] = useState<WheelPrize | null>(null);
  const [lastPrize, setLastPrize] = useState<WheelPrize | null>(null);

  const handleSpinEnd = (prize: WheelPrize) => {
    setLastPrize(prize);
    setPrizeModal(prize);
    onSpin();
  };

  const msg = prizeModal ? prizeMessages[prizeModal.id] : null;
  const PrizeIcon = msg?.icon ?? Gift;
  const isWin = prizeModal ? !prizeModal.id.startsWith("try") : false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-[10px] font-display tracking-[0.3em] uppercase text-raw-gold/50 mb-3">
          Daily Reward
        </p>
        <h1 className="font-display text-2xl tracking-wide text-raw-text sm:text-3xl">
          Wheel of Fortune
        </h1>
        <p className="mt-3 text-sm text-raw-silver/40 max-w-md mx-auto">
          Spin once daily for a chance to earn XP, avatar themes, streak shields, and more.
        </p>
      </div>

      {/* Wheel */}
      <div className="flex justify-center pt-4">
        <WheelOfFortune
          prizes={PRIZES}
          onSpinEnd={handleSpinEnd}
          disabled={hasSpunToday}
        />
      </div>

      {/* Last prize reminder */}
      {hasSpunToday && lastPrize && (
        <div className="mx-auto max-w-sm rounded-2xl border border-raw-border/40 bg-raw-surface/40 p-5 text-center">
          <p className="text-xs text-raw-silver/40 mb-1">Today's Result</p>
          <p className="font-display text-sm tracking-wide text-raw-gold">
            {prizeMessages[lastPrize.id]?.title}
          </p>
          <p className="mt-2 text-xs text-raw-silver/30">
            Come back tomorrow for another spin!
          </p>
        </div>
      )}

      {/* Prize info */}
      <div className="mx-auto max-w-lg">
        <h2 className="font-display text-sm tracking-wide text-raw-text mb-4 text-center">
          Prize Pool
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "50 XP", rarity: "Common", color: "text-raw-silver/50" },
            { label: "100 XP", rarity: "Common", color: "text-raw-gold/60" },
            { label: "200 XP", rarity: "Rare", color: "text-raw-gold/80" },
            { label: "500 XP", rarity: "Jackpot", color: "text-raw-gold" },
            { label: "Streak Shield", rarity: "Rare", color: "text-raw-silver/70" },
            { label: "Avatar Theme", rarity: "Rare", color: "text-raw-gold/80" },
            { label: "Badge", rarity: "Uncommon", color: "text-raw-silver/60" },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-xl border border-raw-border/30 bg-raw-surface/30 p-3 text-center"
            >
              <p className={`text-xs font-medium ${p.color}`}>{p.label}</p>
              <p className="text-[9px] text-raw-silver/25 mt-0.5 uppercase tracking-wider">
                {p.rarity}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Modal */}
      <Dialog open={!!prizeModal} onOpenChange={() => setPrizeModal(null)}>
        <DialogContent className="border-raw-border/40 bg-raw-black/95 backdrop-blur-xl sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div
              className={`mx-auto mb-4 h-16 w-16 rounded-2xl flex items-center justify-center ${
                isWin
                  ? "bg-raw-gold/15 shadow-[0_0_30px_rgba(241,196,45,0.2)]"
                  : "bg-raw-surface"
              }`}
            >
              <PrizeIcon
                className={`h-8 w-8 ${
                  isWin ? "text-raw-gold" : "text-raw-silver/40"
                }`}
              />
            </div>
            <DialogTitle
              className={`font-display text-xl tracking-wide ${
                isWin ? "text-raw-gold" : "text-raw-silver/60"
              }`}
            >
              {msg?.title}
            </DialogTitle>
            <DialogDescription className="text-raw-silver/40 text-sm pt-2">
              {msg?.desc}
            </DialogDescription>
          </DialogHeader>
          <button
            onClick={() => setPrizeModal(null)}
            className={`mt-4 w-full rounded-full py-3 text-sm font-display tracking-[0.15em] uppercase transition-all ${
              isWin
                ? "bg-raw-gold text-raw-black hover:bg-raw-gold/90"
                : "border border-raw-border/40 text-raw-silver/50 hover:bg-raw-surface/50"
            }`}
          >
            {isWin ? "Claim" : "Close"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
