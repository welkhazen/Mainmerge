export interface AvatarTheme {
  bg: string;
  figure: string;
  ring: string;
  glow: string;
  name: string;
  /** Optional path to a rendered avatar image (e.g. PNG/WebP under public/). Falls back to SVG if absent/unreachable. */
  imageSrc?: string;
}

export const LEVEL_THEMES: AvatarTheme[] = [
  { bg: "#1a1a1e", figure: "#4a4a52", ring: "#333338", glow: "none",       name: "Shadow Form",    imageSrc: "/avatars/rank-01.png" },
  { bg: "#1a1a1e", figure: "#5a5a62", ring: "#3a3a40", glow: "none",       name: "Dim Echo",       imageSrc: "/avatars/rank-02.png" },
  { bg: "#1a1c22", figure: "#4466aa", ring: "#334488", glow: "none",       name: "Steel Pulse",    imageSrc: "/avatars/rank-03.png" },
  { bg: "#1a1c24", figure: "#5577bb", ring: "#3355aa", glow: "none",       name: "Deep Current",   imageSrc: "/avatars/rank-04.png" },
  { bg: "#1c1a24", figure: "#7766cc", ring: "#5544aa", glow: "none",       name: "Violet Drift",   imageSrc: "/avatars/rank-05.png" },
  { bg: "#1a1c26", figure: "#4488dd", ring: "#2266cc", glow: "#2266cc40", name: "Neon Nebula",    imageSrc: "/avatars/rank-06.png" },
  { bg: "#1e1a18", figure: "#8B7355", ring: "#6B5335", glow: "none",       name: "Bronze Ember",   imageSrc: "/avatars/rank-07.png" },
  { bg: "#1e1c18", figure: "#C4A76C", ring: "#9B8545", glow: "#C4A76C30", name: "Gold Whisper",   imageSrc: "/avatars/rank-08.png" },
  { bg: "#1e1c16", figure: "#D4B77C", ring: "#B8941A", glow: "#D4B77C40", name: "Aureate Mind",   imageSrc: "/avatars/rank-09.png" },
  { bg: "#1e1c14", figure: "#F1C42D", ring: "#D4A81A", glow: "#F1C42D50", name: "Pure Radiance",  imageSrc: "/avatars/rank-10.png" },
];

export function getAvatarTheme(level: number): AvatarTheme {
  return LEVEL_THEMES[level - 1] || LEVEL_THEMES[0];
}
