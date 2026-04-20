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
  { bg: "#141d16", figure: "#6a8a52", ring: "#3f5a36", glow: "#7fa05a55",  name: "Mossgrown",       imageSrc: "/avatars/avatar-1.png" },
  { bg: "#1a1411", figure: "#e0842a", ring: "#9a531a", glow: "#ff7a0055",  name: "Combat Helm",     imageSrc: "/avatars/avatar-2.png" },
  { bg: "#0f1a26", figure: "#4fc3ff", ring: "#2b78b8", glow: "#4fc3ff66",  name: "Plasma Wraith",   imageSrc: "/avatars/avatar-3.png" },
  { bg: "#120f16", figure: "#4a3a56", ring: "#2e2437", glow: "#6a3fa040",  name: "Shadow Panther",  imageSrc: "/avatars/avatar-4.png" },
  { bg: "#1a1014", figure: "#c4c4cc", ring: "#7a1f22", glow: "#ff2a2a55",  name: "Death Chrome",    imageSrc: "/avatars/avatar-5.png" },
  { bg: "#1a1510", figure: "#d4a84c", ring: "#8a6a22", glow: "#e0b05055",  name: "Gilded Samurai",  imageSrc: "/avatars/avatar-6.png" },
  { bg: "#1c1422", figure: "#ff66b0", ring: "#a5367a", glow: "#ff66b055",  name: "Neon Streamer",   imageSrc: "/avatars/avatar-7.png" },
  { bg: "#1a1020", figure: "#9a4ddf", ring: "#5b2a8a", glow: "#b96aff60",  name: "Violet Overlord", imageSrc: "/avatars/avatar-8.png" },
];

export function getAvatarTheme(level: number): AvatarTheme {
  return LEVEL_THEMES[level - 1] || LEVEL_THEMES[0];
}
