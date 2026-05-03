# Avatar images

The landing page's avatar-identity section (`src/components/landing/AvatarIdentity.tsx`) and onboarding flow (`src/components/onboarding/OnboardingJourney.tsx`) render each rank's icon using the procedural SVG in `src/components/ui/avatar-figure.tsx`, driven by the theme defined for each rank in `src/lib/avatar-theme.ts`.

If a PNG is present at `/avatars/avatar-<n>.png` AND the theme entry for that rank sets an `imageSrc`, the PNG is used instead of the SVG. Missing or broken images automatically fall back to the SVG.

## Ranks

There are 10 ranks. Colors are defined in `LEVEL_THEMES` in `src/lib/avatar-theme.ts`.

| Rank | Theme name        | Color palette |
| ---- | ----------------- | ------------- |
| 1    | Silver Initiate   | Silver        |
| 2    | Cyan Scout        | Cyan          |
| 3    | Azure Sentinel    | Blue          |
| 4    | Emerald Ranger    | Bright green  |
| 5    | Forest Guardian   | Deep green    |
| 6    | Rose Phantom      | Pink          |
| 7    | Violet Overlord   | Purple        |
| 8    | Ember Warlord     | Orange        |
| 9    | Crimson Reaper    | Red           |
| 10   | Golden Legend     | Gold          |

To use PNG artwork instead of the SVG, drop a file at `public/avatars/avatar-<n>.png` (square, 512×512 recommended) and add `imageSrc: "/avatars/avatar-<n>.png"` to the corresponding entry in `LEVEL_THEMES`.
