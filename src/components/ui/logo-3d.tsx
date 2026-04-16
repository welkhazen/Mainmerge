interface Logo3DProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export function Logo3D({ size = 132, className = "" }: Logo3DProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="raW 3D logo"
    >
      {/*
        The GIF has a gray background (~#505050).
        We use a combination of:
        1. A circular mask with feathered edges to smoothly fade the GIF into the background
        2. CSS filter to darken the gray tones to near-black
        3. mix-blend-mode to merge the remaining gray with the dark page
      */}
      <div
        className="absolute inset-[-15%] overflow-hidden"
        style={{
          maskImage: "radial-gradient(circle at center, black 30%, rgba(0,0,0,0.6) 42%, transparent 58%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 30%, rgba(0,0,0,0.6) 42%, transparent 58%)",
        }}
      >
        <img
          src="/logo-3d.gif"
          alt="raW 3D logo"
          className="h-full w-full object-contain"
          style={{
            filter: "brightness(0.75) contrast(1.3)",
            mixBlendMode: "screen",
          }}
          draggable={false}
        />
      </div>

      {/* Subtle gold glow behind the logo to match site aesthetic */}
      <div
        className="pointer-events-none absolute inset-[-10%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(241,196,45,0.06) 0%, transparent 55%)",
        }}
      />
    </div>
  );
}
