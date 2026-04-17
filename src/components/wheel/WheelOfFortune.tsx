import { useState, useRef, useCallback, useEffect } from "react";

export interface WheelPrize {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  textColor: string;
}

interface WheelOfFortuneProps {
  prizes: WheelPrize[];
  onSpinEnd: (prize: WheelPrize) => void;
  onSpinStart?: () => void;
  disabled?: boolean;
}

const SPIN_DURATION = 5000;
const MIN_ROTATIONS = 5;
const MAX_ROTATIONS = 8;

function getSegmentPath(
  index: number,
  total: number,
  radius: number
): string {
  const angle = 360 / total;
  const startAngle = index * angle - 90;
  const endAngle = startAngle + angle;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const cx = radius;
  const cy = radius;

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArc = angle > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function getTextPosition(
  index: number,
  total: number,
  radius: number
): { x: number; y: number; rotation: number } {
  const angle = 360 / total;
  const midAngle = index * angle + angle / 2 - 90;
  const midRad = (midAngle * Math.PI) / 180;
  const textRadius = radius * 0.65;
  const cx = radius;
  const cy = radius;

  return {
    x: cx + textRadius * Math.cos(midRad),
    y: cy + textRadius * Math.sin(midRad),
    rotation: midAngle + 90,
  };
}

export function WheelOfFortune({
  prizes,
  onSpinEnd,
  onSpinStart,
  disabled = false,
}: WheelOfFortuneProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const currentPrizeRef = useRef<WheelPrize | null>(null);

  const radius = 200;
  const size = radius * 2;
  const total = prizes.length;

  const handleSpin = useCallback(() => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    onSpinStart?.();

    const prizeIndex = Math.floor(Math.random() * total);
    currentPrizeRef.current = prizes[prizeIndex];

    const segmentAngle = 360 / total;
    // Target: the center of the winning segment should end up at the top (pointer position)
    // Segment center angle = prizeIndex * segmentAngle + segmentAngle / 2
    // We need to rotate so that this center aligns with the top (0 degrees / 360 degrees)
    const targetOffset = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
    const fullRotations =
      (MIN_ROTATIONS + Math.random() * (MAX_ROTATIONS - MIN_ROTATIONS)) * 360;
    const finalRotation = rotation + fullRotations + targetOffset;

    setRotation(finalRotation);
  }, [isSpinning, disabled, total, prizes, rotation, onSpinStart]);

  useEffect(() => {
    if (!isSpinning) return;

    const timer = setTimeout(() => {
      setIsSpinning(false);
      if (currentPrizeRef.current) {
        onSpinEnd(currentPrizeRef.current);
      }
    }, SPIN_DURATION + 200);

    return () => clearTimeout(timer);
  }, [isSpinning, onSpinEnd]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20">
        <svg width="32" height="40" viewBox="0 0 32 40">
          <defs>
            <linearGradient id="pointerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1C42D" />
              <stop offset="100%" stopColor="#B8941E" />
            </linearGradient>
            <filter id="pointerShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F1C42D" floodOpacity="0.4" />
            </filter>
          </defs>
          <polygon
            points="16,36 4,8 16,14 28,8"
            fill="url(#pointerGrad)"
            stroke="#F1C42D"
            strokeWidth="1"
            filter="url(#pointerShadow)"
          />
        </svg>
      </div>

      {/* Wheel outer glow */}
      <div className="rounded-full p-1 bg-gradient-to-br from-raw-gold/30 via-raw-gold/10 to-raw-gold/30 shadow-[0_0_40px_rgba(241,196,45,0.15)]">
        <div className="rounded-full p-[3px] bg-raw-black">
          {/* Wheel SVG */}
          <svg
            ref={wheelRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${size} ${size}`}
            className="block max-w-[400px] max-h-[400px] w-full h-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                : "none",
            }}
          >
            <defs>
              <filter id="innerShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                <feOffset dx="0" dy="0" result="offsetBlur" />
                <feComposite in="SourceGraphic" in2="offsetBlur" operator="over" />
              </filter>
            </defs>

            {/* Segments */}
            {prizes.map((prize, i) => {
              const path = getSegmentPath(i, total, radius);
              const textPos = getTextPosition(i, total, radius);
              return (
                <g key={prize.id}>
                  <path
                    d={path}
                    fill={prize.color}
                    stroke="#1a1a1a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={prize.textColor}
                    fontSize={total > 10 ? "10" : "12"}
                    fontFamily="'Michroma', sans-serif"
                    fontWeight="600"
                    letterSpacing="0.05em"
                  >
                    {prize.shortLabel}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle cx={radius} cy={radius} r={radius * 0.15} fill="#080808" stroke="#F1C42D" strokeWidth="2" />
            <circle cx={radius} cy={radius} r={radius * 0.12} fill="#0c0c0c" stroke="#F1C42D" strokeWidth="0.5" />

            {/* Dot markers on outer edge */}
            {prizes.map((_, i) => {
              const angle = (i * 360) / total - 90;
              const rad = (angle * Math.PI) / 180;
              const dotR = radius - 8;
              const cx = radius + dotR * Math.cos(rad);
              const cy = radius + dotR * Math.sin(rad);
              return (
                <circle
                  key={`dot-${i}`}
                  cx={cx}
                  cy={cy}
                  r="3"
                  fill="#F1C42D"
                  opacity="0.5"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || disabled}
        className={`mt-8 relative overflow-hidden rounded-full px-10 py-3.5 font-display text-sm tracking-[0.2em] uppercase transition-all ${
          isSpinning || disabled
            ? "bg-raw-surface text-raw-silver/30 border border-raw-border/30 cursor-not-allowed"
            : "bg-gradient-to-r from-raw-gold to-yellow-500 text-raw-black hover:shadow-[0_0_30px_rgba(241,196,45,0.3)] hover:scale-105 active:scale-95"
        }`}
      >
        {isSpinning ? "Spinning..." : disabled ? "Come Back Tomorrow" : "Spin"}
      </button>
    </div>
  );
}
