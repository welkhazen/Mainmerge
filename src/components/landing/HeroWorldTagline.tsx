import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HeroWorldTaglineProps {
  className?: string;
}

export function HeroWorldTagline({ className }: HeroWorldTaglineProps) {
  return (
    <Card
      className={cn(
        "hero-world-tagline mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border-raw-gold/30 bg-raw-black/45 shadow-[0_0_34px_rgba(241,196,45,0.14)] backdrop-blur-md",
        className,
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 px-4 py-4 text-center sm:px-6 sm:py-5">
        <p className="hero-tagline-metallic font-display text-lg font-medium leading-relaxed tracking-[0.04em] sm:text-xl md:text-2xl">
          Your Always-Living and Ever-Growing New World
        </p>
        <Badge className="rounded-full border border-raw-gold/45 bg-raw-gold/10 px-4 py-1.5 font-display text-xs font-medium tracking-[0.24em] text-raw-gold shadow-[0_0_18px_rgba(241,196,45,0.2)] hover:bg-raw-gold/10 sm:text-sm">
          Online 24/7
        </Badge>
      </CardContent>
    </Card>
  );
}
