import { useEffect, useRef, useState } from "react";

interface Logo3DProps {
  size?: number;
  className?: string;
  interactive?: boolean;
  colorScheme?: "gold" | "white";
}

function LogoMark({ size, colorScheme }: { size: number; colorScheme: "gold" | "white" }) {
  const isWhite = colorScheme === "white";

  return (
    <div
      className="font-display tracking-[0.01em] leading-none select-none"
      style={{
        fontSize: size * 0.44,
        background: isWhite
          ? "linear-gradient(135deg, #FFFFFF 0%, #F4F4F4 50%, #DCDCDC 100%)"
          : "linear-gradient(135deg, #F6D454 0%, #F1C42D 40%, #B8941E 65%, #F1C42D 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        filter: isWhite
          ? "drop-shadow(0 0 18px rgba(255,255,255,0.45)) drop-shadow(0 0 32px rgba(255,255,255,0.2))"
          : "drop-shadow(0 0 18px rgba(241,196,45,0.45)) drop-shadow(0 0 32px rgba(241,196,45,0.2))",
      }}
    >
      raW
    </div>
  );
}

export function Logo3D({ size = 132, className = "", colorScheme = "gold" }: Logo3DProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOk, setVideoOk] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onError = () => setVideoOk(false);
    v.addEventListener("error", onError);
    // If no sources resolve, the video may stay in readyState 0 — bail after a short wait
    const timer = window.setTimeout(() => {
      if (v.readyState === 0 && v.networkState === 3 /* NETWORK_NO_SOURCE */) {
        setVideoOk(false);
      }
    }, 1500);
    return () => {
      v.removeEventListener("error", onError);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="raW logo"
    >
      {/* Gold glow halo behind the mark */}
      <div
        className="pointer-events-none absolute inset-[-30%] rounded-full"
        style={{
          background:
            colorScheme === "white"
              ? "radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(241,196,45,0.16) 0%, rgba(241,196,45,0.05) 40%, transparent 70%)",
        }}
      />

      {/* Always-present fallback text — visible until/unless the video paints */}
      <div className="absolute inset-0 flex items-center justify-center">
        <LogoMark size={size} colorScheme={colorScheme} />
      </div>

      {videoOk && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            WebkitMaskImage:
              "radial-gradient(circle at center, black 55%, rgba(0,0,0,0.6) 72%, transparent 92%)",
            maskImage:
              "radial-gradient(circle at center, black 55%, rgba(0,0,0,0.6) 72%, transparent 92%)",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            style={{ mixBlendMode: "screen" }}
          >
            <source src="/logo.webm" type="video/webm" />
            <source src="/logo.mp4" type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
