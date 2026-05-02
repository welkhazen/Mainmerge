import { useState } from "react";
import { LEVEL_THEMES, getAvatarTheme } from "@/lib/avatar-theme";

interface AvatarFigureProps {
  level: number;
  size?: "sm" | "md" | "lg" | "xl";
  selected?: boolean;
  className?: string;
}

const sizes = {
  sm: { outer: 48, inner: 36, face: 0.55 },
  md: { outer: 72, inner: 56, face: 0.6 },
  lg: { outer: 120, inner: 96, face: 0.65 },
  xl: { outer: 180, inner: 148, face: 0.65 },
};

export function AvatarFigure({ level, size = "md", selected = false, className = "" }: AvatarFigureProps) {
  const theme = LEVEL_THEMES[level - 1] || LEVEL_THEMES[0];
  const [imageFailed, setImageFailed] = useState(false);
  const useImage = !!theme.imageSrc && !imageFailed;
  const s = sizes[size];

  if (useImage) {
    return (
      <div
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: s.outer, height: s.outer }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${theme.bg} 0%, #050505 70%)`,
            boxShadow: selected ? `0 0 0 2px ${theme.ring}` : "inset 0 0 10px rgba(0,0,0,0.4)",
          }}
        >
          <img
            src={theme.imageSrc}
            alt={theme.name}
            onError={() => setImageFailed(true)}
            draggable={false}
            className="h-full w-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
        </div>
      </div>
    );
  }

  const cx = s.outer / 2;
  const cy = s.outer / 2;
  const r = s.inner / 2;
  const faceScale = s.face;

  // Goggle/face dimensions relative to center
  const eyeW = r * faceScale * 0.35;
  const eyeH = r * faceScale * 0.22;
  const eyeY = cy - r * 0.08;
  const eyeGap = r * faceScale * 0.12;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={s.outer} height={s.outer} viewBox={`0 0 ${s.outer} ${s.outer}`}>
        {/* Ring for selected/high level */}
        {(selected || theme.glow !== "none") && (
          <circle
            cx={cx}
            cy={cy}
            r={r + 3}
            fill="none"
            stroke={selected ? theme.ring : theme.ring}
            strokeWidth={selected ? 2 : 1}
            opacity={selected ? 0.9 : 0.4}
          />
        )}

        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill={theme.bg} />

        {/* Inner gradient overlay */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="url(#innerGrad)"
          opacity={0.3}
        />

        {/* Reflection/shine at bottom */}
        <ellipse
          cx={cx}
          cy={cy + r * 0.55}
          rx={r * 0.35}
          ry={r * 0.08}
          fill={theme.figure}
          opacity={0.25}
        />

        {/* Head silhouette */}
        <circle
          cx={cx}
          cy={cy - r * 0.05}
          r={r * faceScale * 0.45}
          fill={theme.figure}
          opacity={0.85}
        />

        {/* Body/shoulders */}
        <ellipse
          cx={cx}
          cy={cy + r * 0.45}
          rx={r * faceScale * 0.55}
          ry={r * faceScale * 0.3}
          fill={theme.figure}
          opacity={0.7}
        />

        {/* Goggle band */}
        <rect
          x={cx - eyeW - eyeGap / 2}
          y={eyeY - eyeH / 2}
          width={eyeW * 2 + eyeGap}
          height={eyeH}
          rx={eyeH / 2}
          fill={theme.bg}
          opacity={0.9}
        />

        {/* Left goggle lens */}
        <ellipse
          cx={cx - eyeGap / 2 - eyeW / 2}
          cy={eyeY}
          rx={eyeW / 2 + 1}
          ry={eyeH / 2 + 1}
          fill={theme.figure}
          opacity={0.6}
        />

        {/* Right goggle lens */}
        <ellipse
          cx={cx + eyeGap / 2 + eyeW / 2}
          cy={eyeY}
          rx={eyeW / 2 + 1}
          ry={eyeH / 2 + 1}
          fill={theme.figure}
          opacity={0.6}
        />

        {/* Goggle shine */}
        <ellipse
          cx={cx - eyeGap / 2 - eyeW / 2 - 1}
          cy={eyeY - 1}
          rx={eyeW / 5}
          ry={eyeH / 4}
          fill="#ffffff"
          opacity={0.15}
        />
        <ellipse
          cx={cx + eyeGap / 2 + eyeW / 2 - 1}
          cy={eyeY - 1}
          rx={eyeW / 5}
          ry={eyeH / 4}
          fill="#ffffff"
          opacity={0.15}
        />

        {/* Defs */}
        <defs>
          <radialGradient id="innerGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={theme.figure} stopOpacity={0.15} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
