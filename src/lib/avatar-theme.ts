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
  { bg: "#1a1a1a", figure: "#c8c8c8", ring: "#c8c8c8", glow: "#c8c8c8",       name: "Silver Initiate", imageSrc: "/avatars/avatar-1.svg"  },
  { bg: "#0c1a24", figure: "#5ed6ff", ring: "#5ed6ff", glow: "#5ed6ff80",  name: "Cyan Scout",      imageSrc: "/avatars/avatar-2.svg"  },
  { bg: "#0a1124", figure: "#3f8bff", ring: "#3f8bff", glow: "#3f8bff80",  name: "Azure Sentinel",  imageSrc: "/avatars/avatar-3.svg"  },
  { bg: "#0f1f12", figure: "#4ade80", ring: "#4ade80", glow: "#4ade8080",  name: "Emerald Ranger",  imageSrc: "/avatars/avatar-4.svg"  },
  { bg: "#0b1a0e", figure: "#16a34a", ring: "#16a34a", glow: "#16a34a80",  name: "Forest Guardian", imageSrc: "/avatars/avatar-5.svg"  },
  { bg: "#1f0d18", figure: "#ec4899", ring: "#ec4899", glow: "#ec489980",  name: "Rose Phantom",    imageSrc: "/avatars/avatar-6.svg"  },
  { bg: "#150a22", figure: "#8b5cf6", ring: "#8b5cf6", glow: "#8b5cf680",  name: "Violet Overlord", imageSrc: "/avatars/avatar-7.svg"  },
  { bg: "#1f1208", figure: "#f97316", ring: "#f97316", glow: "#f9731680",  name: "Ember Warlord",   imageSrc: "/avatars/avatar-8.svg"  },
  { bg: "#1f0a0a", figure: "#dc2626", ring: "#dc2626", glow: "#dc262680",  name: "Crimson Reaper",  imageSrc: "/avatars/avatar-9.svg"  },
  { bg: "#1f1705", figure: "#facc15", ring: "#facc15", glow: "#facc1590",  name: "Golden Legend",   imageSrc: "/avatars/avatar-10.svg" },
];

/** Get avatar by 1-based index (matches stored avatarLevel values). */
export function getAvatar(index: number): AvatarTheme {
  return AVATARS[index - 1] || AVATARS[0];
}
