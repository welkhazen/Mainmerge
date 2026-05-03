# Clean PR Notes

This branch should be reviewed as a focused technical change-set with three outcomes:

1. Tooling alignment: Vite/Vitest use `@vitejs/plugin-react`.
2. Code-splitting baseline: top-level routes are lazy-loaded in `src/App.tsx`.
3. Module hygiene: theme context/hook split and UI variant extraction reduce mixed exports and improve maintainability.

## What to verify quickly
- `npm run lint:ci`
- `npm test`
- `npm run build`

## Suggested better follow-up flow
To keep future reviews smoother and smaller, split next work into:
- PR 1: Perf only (`Index` internal chunking + dynamic import boundary cleanup).
- PR 2: DX/architecture only (remaining module-boundary refactors).
- PR 3: Asset optimization only (image/video size reductions + responsive delivery).
