# Diagnose Report (2026-05-02)

## Scope
Used the `diagnose` skill workflow to establish a fast feedback loop and identify current actionable problems.

## Feedback loop (Phase 1)
- `npm test`
- `npm run lint`
- `npm run build`

This gives deterministic, agent-runnable signals for correctness, code quality, and production build health.

## Reproduction summary (Phase 2)
No hard runtime failure is currently reproducible in the default local loop. All tests pass and build succeeds. The current problems are warning-level quality and performance risks.

## Ranked hypotheses (Phase 3)
1. Lint warning volume is caused primarily by broad component files mixing exports, tripping fast-refresh guidance.
2. Bundle size warning is caused by large media assets and insufficient code splitting in route-level modules.
3. Dynamic import ineffectiveness is caused by `src/backend/supabase/client.ts` being imported both statically and dynamically.
4. Tooling warning about `@vitejs/plugin-react-swc` reflects an upgrade path issue, not app logic failure.

## Instrumentation and findings (Phase 4)
- Lint confirms 10 warnings, mostly `react-refresh/only-export-components`, plus one `react-hooks/exhaustive-deps` issue.
- Build confirms a very large main JS chunk (~1.89 MB minified) and ineffective dynamic import warning for Supabase client.
- NPM prints an env warning: unknown `http-proxy` config in local npm config.

## Problems identified

### 1) Reactive cleanup bug risk (highest confidence code issue)
`src/components/ui/dotted-surface.tsx` has a hooks warning where `containerRef.current` is captured in cleanup in a way that can drift between mount and unmount.

### 2) Fast-refresh/component-export warnings (developer-experience issue)
Several UI files export non-component symbols alongside components, creating 9 warnings. This is not a production crash, but harms HMR reliability.

### 3) Bundle/chunking performance risk (user-impact issue)
Main bundle and assets are large; build warns that chunks exceed threshold and suggests additional splitting.

### 4) Dynamic import not effective (architecture issue)
A module intended for lazy load is also statically imported elsewhere, so it remains in main chunks.

### 5) Tooling drift warning
`vite:react-swc` recommends migration to `@vitejs/plugin-react-oxc` and notes deprecated option forwarding.

## Suggested next actions (better-flow alternatives)
1. **Fix the real hooks warning first** (`dotted-surface.tsx`) because it may hide real lifecycle bugs.
2. **Set a warning budget in CI** (`eslint --max-warnings=0` in PR checks) after warnings are reduced.
3. **Refactor export patterns** by moving constants/helpers from UI component files into adjacent `*.utils.ts` files.
4. **Add route-level lazy boundaries** for heavy pages/components and recheck `npm run build` chunk output.
5. **Decouple backend supabase client import strategy** so lazy path is truly lazy (or accept static and remove dynamic import to reduce confusion).
6. **Plan migration from react-swc plugin to react-oxc** in a dedicated tooling PR to reduce build-warning noise.

## Optional high-leverage path
If you want, I can execute a focused follow-up that:
- fixes the `dotted-surface.tsx` hook cleanup warning,
- removes at least 3 fast-refresh warnings,
- and verifies reduced warning count with the same loop.
