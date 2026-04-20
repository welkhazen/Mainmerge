# Avatar images

The landing page's avatar-identity section (`src/components/landing/AvatarIdentity.tsx`) and onboarding flow (`src/components/onboarding/OnboardingJourney.tsx`) render each rank's icon from a PNG file in this directory. If a file is missing or fails to load, `AvatarFigure` falls back to a procedural SVG.

## Expected files

Place one PNG per rank. Square aspect ratio (e.g. 512×512) recommended; transparent or dark backgrounds work best since the icon sits on a gradient tile.

| Rank | Theme name       | Filename         | Character (from reference composite) |
| ---- | ---------------- | ---------------- | ------------------------------------ |
| 1    | Mossgrown        | `avatar-1.png`   | Mossy stone guardian (green)         |
| 2    | Combat Helm      | `avatar-2.png`   | Orange-visored robot helmet          |
| 3    | Plasma Wraith    | `avatar-3.png`   | Electric-blue glowing figure         |
| 4    | Shadow Panther   | `avatar-4.png`   | Black panther mask                   |
| 5    | Death Chrome     | `avatar-5.png`   | Silver skull with red eyes           |
| 6    | Gilded Samurai   | `avatar-6.png`   | Gold samurai warrior                 |
| 7    | Neon Streamer    | `avatar-7.png`   | Pink-haired gamer with headphones    |
| 8    | Violet Overlord  | `avatar-8.png`   | Purple mechanical overlord           |

Paths are wired in `src/lib/avatar-theme.ts` as `/avatars/avatar-<n>.png`.
