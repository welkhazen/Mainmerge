# Analytics

Single entry point for all product analytics.

## Rules

1. Always use `track()` from `@/lib/analytics`. Feature code should never call a
   third-party analytics SDK directly.
2. Every event must exist in `events.ts` as a variant of the `AppEvent`
   discriminated union. Adding a new event is a type change, not a string.
3. Property shapes are compile-time enforced. `track("poll_answered", { ... })`
   fails type-check if any required property is missing.
4. In dev mode, every `track()` call also logs to the console as
   `[analytics] <name> { ...props }`.
5. In test mode (`import.meta.env.MODE === "test"`), `track()` is a no-op.

## Public API

```ts
import { track, trackCustom, identify, reset, group, registerSuperProps, useTrack } from "@/lib/analytics";
import { useTrackPageView } from "@/lib/analytics/useTrackPageView";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
```

`track(name, properties)` — fire an event.
`trackCustom(name, properties?)` — temporary/diagnostic custom event (avoid for long-term product metrics).
`identify(userId, traits)` — attach a user id.
`reset()` — clear identity on logout.
`group(type, key, traits)` — attach the user to a group (e.g. community).
`registerSuperProps(props)` — set props included with every subsequent event.
`useTrack()` — hook form of `track`; prefer inside components.
`useTrackPageView()` — mount once near the router; fires `page_viewed`.
`useTrackSectionView(sectionId)` — returns a ref; fires `landing_section_viewed`
once per session when 50% visible.

## Current backend

No analytics backend is currently wired. `track()` and related APIs log to the
console in dev mode and no-op otherwise. To plug in a provider, implement the
`AnalyticsClient` interface in `client.ts` and call `setClient()` at app
startup.
