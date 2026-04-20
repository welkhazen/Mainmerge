# Analytics

Single entry point for all product analytics.

## Rules

1. Never call `posthog.capture` directly in feature code. Use `track()` from
   `@/lib/analytics`. This module is the only place allowed to talk to the
   PostHog client.
2. Every event must exist in `events.ts` as a variant of the `AppEvent`
   discriminated union. Adding a new event is a type change, not a string.
3. Property shapes are compile-time enforced. `track("poll_answered", { ... })`
   fails type-check if any required property is missing.
4. In dev mode, every `track()` call also logs to the console as
   `[analytics] <name> { ...props }`.
5. In test mode (`import.meta.env.MODE === "test"`), `track()` is a no-op.

## Public API

```ts
import { track, identify, reset, group, registerSuperProps, useTrack } from "@/lib/analytics";
import { useTrackPageView } from "@/lib/analytics/useTrackPageView";
import { useTrackSectionView } from "@/lib/analytics/useTrackSectionView";
```

`track(name, properties)` — fire an event.
`identify(userId, traits)` — attach a user id; also aliases the anon id.
`reset()` — clear identity on logout.
`group(type, key, traits)` — attach the user to a group (e.g. community).
`registerSuperProps(props)` — set props included with every subsequent event.
`useTrack()` — hook form of `track`; prefer inside components.
`useTrackPageView()` — mount once near the router; fires `page_viewed`.
`useTrackSectionView(sectionId)` — returns a ref; fires `landing_section_viewed`
once per session when 50% visible.

## Firing sites (authoritative map)

| Event | File |
|---|---|
| `page_viewed` | `useTrackPageView` |
| `landing_section_viewed` | landing sections via `useTrackSectionView` |
| `landing_cta_clicked` | `Hero`, `Navbar`, `PollSection`, `Communities`, `AvatarIdentity`, `WhyAnonymity`, `FinalCTA` |
| `landing_poll_sampled` / `signup_gate_triggered` | `PollSection` |
| `waitlist_submitted` | `FinalCTA` |
| `demo_video_played` | `Communities` |
| `signup_modal_opened` / `signup_started` / `signup_otp_sent` / `signup_otp_verified` / `signup_failed` | `SignupModal` |
| `signup_completed` | `useRawStore.registerOrUpdateUser` path |
| `login_started` / `login_completed` / `login_failed` | `StytchLoginForm`, `SignupModal`, `useRawStore.login` |
| `session_expired` | `useSyncStytchAuth` |
| `logout_clicked` | `DashboardNav` |
| `onboarding_*` | `OnboardingJourney` and `useRawStore.completeOnboarding` |
| `poll_answered` / `poll_skipped` / `poll_comment_posted` | `useRawStore.vote`, `SwipeablePollCard`, `DashboardPolls` |
| `daily_spin_opened` / `daily_spin_claimed` | `DashboardDailySpin` |
| `challenge_*` | `DashboardChallenges` |
| `community_*` | `DashboardCommunities`, `lib/communityChat` |
| `avatar_level_up` | `useRawStore` (setAvatarLevel wrapper) |
| `admin_action_performed` | `Admin.tsx` mutations |
| `error_boundary_triggered` | `ErrorBoundary` |
| `api_error` | `lib/http.ts` |
| `web_vitals_reported` | `AnalyticsProvider` |

## Linting

`eslint.config.js` contains a `no-restricted-syntax` rule forbidding direct
`posthog.capture(...)` calls outside `src/lib/analytics/**`. If you see the
rule firing, you're in feature code — use `track()` instead.

## Why a module-level client

`track()` can be called from zustand stores, plain modules, and imperative
error handlers where hooks aren't available. `AnalyticsProvider` assigns the
live PostHog client to a module-level ref at mount time; `track()` reads from
that ref. Inside components you can also use `useTrack()` which binds to the
hook-provided client.
