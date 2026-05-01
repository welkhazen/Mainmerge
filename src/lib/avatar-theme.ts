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
  { bg: "#1a1a1a", figure: "#c8c8c8", ring: "#8a8a8a", glow: "none",       name: "Silver Initiate"  },
  { bg: "#0c1a24", figure: "#5ed6ff", ring: "#2ea6d6", glow: "#5ed6ff80",  name: "Cyan Scout"       },
  { bg: "#0a1124", figure: "#3f8bff", ring: "#2557c4", glow: "#3f8bff80",  name: "Azure Sentinel"   },
  { bg: "#0f1f12", figure: "#4ade80", ring: "#22a84a", glow: "#4ade8080",  name: "Emerald Ranger"   },
  { bg: "#0b1a0e", figure: "#16a34a", ring: "#0f7a36", glow: "#16a34a80",  name: "Forest Guardian"  },
  { bg: "#1f0d18", figure: "#ec4899", ring: "#a6235f", glow: "#ec489980",  name: "Rose Phantom"     },
  { bg: "#150a22", figure: "#8b5cf6", ring: "#5b2aa8", glow: "#8b5cf680",  name: "Violet Overlord"  },
  { bg: "#1f1208", figure: "#f97316", ring: "#b0550f", glow: "#f9731680",  name: "Ember Warlord"    },
  { bg: "#1f0a0a", figure: "#dc2626", ring: "#8a1515", glow: "#dc262680",  name: "Crimson Reaper"   },
  { bg: "#1f1705", figure: "#facc15", ring: "#b8900b", glow: "#facc1590",  name: "Golden Legend"    },
];

export const MAX_LEVEL = LEVEL_THEMES.length;

export function getAvatarTheme(level: number): AvatarTheme {
  return LEVEL_THEMES[level - 1] || LEVEL_THEMES[0];
}
