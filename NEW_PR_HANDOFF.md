# New PR Handoff (Codex warning-safe workflow)

## Why this exists
Codex cannot safely update a PR that was modified outside Codex after creation. The safe path is to push a fresh branch tip and open a **new PR**.

## What to do now (minimal, warning-safe)
1. Ensure your local branch contains the latest Codex commits.
2. Push this branch to remote.
3. Open a new PR from this branch instead of trying to reuse the old PR thread.

## Branch update/push commands
```bash
# verify branch + recent commits
git branch --show-current
git log --oneline -n 8

# sync base branch
git fetch origin
git rebase origin/main

# push branch (or force-with-lease if branch already exists remotely)
git push -u origin "$(git branch --show-current)"
# if needed after rebase:
git push --force-with-lease
```

## Scope already delivered on this branch
- React plugin migration to `@vitejs/plugin-react` in both Vite and Vitest configs.
- Lint CI zero-warning gate (`lint:ci`).
- Route-level lazy loading of top-level pages in `App.tsx`.
- Theme/context split and UI variant extraction work from prior commits.

## Remaining changes (recommended as separate, focused PRs)

### PR A — Performance: split inside `Index` route (highest impact)
**Why**: build output shows largest chunk now concentrated in `Index` route chunk.

**How to implement**
1. Identify heavy sections inside `src/pages/Index.tsx` (dashboard/hero/chat/3D-heavy modules).
2. Convert heavy sections to `React.lazy` + local `Suspense` boundaries.
3. Keep above-the-fold hero and nav eager; lazy-load deep panels/modals.
4. Rebuild and compare chunk table.

### PR B — Dynamic import effectiveness
**Why**: current warning indicates `src/backend/supabase/client.ts` is both static and dynamic imported, preventing split.

**How to implement**
1. Pick one strategy per execution path:
   - either make it purely static (remove dynamic import), or
   - isolate dynamic-only code to a separate module not statically imported elsewhere.
2. Refactor `src/lib/api/client.ts` and backend controllers so the chosen module boundary is consistent.
3. Rebuild and verify warning disappears.

### PR C — Asset weight optimization
**Why**: several large images/webm assets dominate transfer cost.

**How to implement**
1. Convert oversized PNGs to modern formats (AVIF/WebP) where acceptable.
2. Add responsive sources (`srcset`) and lazy image loading for offscreen content.
3. Rebuild and compare gzip/brotli output.

## Better-flow alternative (recommended)
Adopt a two-lane workflow:
- **Lane 1 (stability lane)**: lint/test/tooling-only PRs.
- **Lane 2 (perf lane)**: bundle-size and loading PRs.

This keeps reviews sharper and avoids mixed regressions.
