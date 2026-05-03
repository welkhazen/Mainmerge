# Deepening Opportunities (2026-05-02)

## Inputs reviewed
- No `CONTEXT.md` found in repository root.
- No ADR directory (`docs/adr/`) found.
- Review focused on client store modules, community chat modules, and auth modules.

## Candidates

### 1) Deepen the Session & Onboarding module in the client store
- **Files**
  - `src/store/useRawStore.ts`
  - `src/store/useAuth.ts`
  - `src/store/useOnboarding.ts`
  - `src/store/usePolls.ts`
  - `src/store/useCommunities.ts`
  - `src/store/useRewards.ts`
- **Problem**
  - `useRawStore` is a broad pass-through module: its interface mirrors many child modules and leaks their implementation details to callers.
  - The deletion test suggests low depth: deleting `useRawStore` would mostly push the same shape into callers, not remove complexity.
  - Test surface is fragmented because behavior lives in multiple hooks while integration invariants (e.g. login/onboarding/poll limits) are spread across the call graph.
- **Solution**
  - Create a deeper module that owns session lifecycle and onboarding progression as a single module with a smaller interface.
  - Keep submodules internal adapters (auth, polls, rewards, communities), and expose task-level operations (e.g. `startSession`, `answerPoll`, `completeOnboarding`) instead of raw state and setters.
- **Benefits**
  - **Locality** improves: state transition rules live in one implementation.
  - **Leverage** improves: callers get higher-level operations and fewer cross-module invariants to remember.
  - Tests improve by targeting one interface with scenario tests instead of many shallow hook tests.

### 2) Deepen the Community Chat persistence module
- **Files**
  - `src/lib/communityChat.ts`
  - `src/lib/communityChat.storage.ts`
  - `src/lib/communityChat.utils.ts`
  - `src/lib/communityChat.seed.ts`
  - `src/lib/communityChat.types.ts`
- **Problem**
  - Domain rules (membership, timestamps, built-in overrides, retired IDs, lock semantics) and persistence orchestration are mixed in one module.
  - Most operations repeat read-map-write patterns, making ordering and data integrity invariants easy to drift.
  - Current seam is hypothetical: there is effectively one concrete persistence adapter (`localStorage`-style storage), so behavior is hard to substitute in tests.
- **Solution**
  - Extract a deep module that owns community chat rules and transaction-like update flows.
  - Keep persistence as an adapter behind a seam (`read`, `write`, atomic update helper).
  - Centralize invariant checks (member existence, monotonic timestamps, locked communities) in one implementation.
- **Benefits**
  - **Locality** improves: rule changes happen in one place rather than across many operations.
  - **Leverage** improves: callers invoke a small set of intent-driven operations and stop managing read-map-write mechanics.
  - Tests improve with deterministic behavior tests at the module interface plus adapter contract tests.

### 3) Deepen the Auth flow module on the server
- **Files**
  - `server/routes/auth.ts`
  - `server/lib/userRepository.ts`
  - `server/lib/otp.ts`
  - `server/lib/store.ts`
  - `server/lib/audit.ts`
- **Problem**
  - The route module contains extensive implementation details: validation, lockouts, OTP lifecycle, signup state machine, session mutation, and audit orchestration.
  - This creates a shallow seam at HTTP handlers; route-level tests must cover too much behavior through many branches.
  - In-memory maps for lockouts/magic links/signup rates are tightly coupled to request handlers, reducing locality and making expiry behavior hard to test.
- **Solution**
  - Introduce a deep Auth module for command-style operations (`requestSignupOtp`, `verifySignupOtp`, `login`, `requestMagicLink`, `verifyMagicLink`).
  - Keep HTTP routes as thin adapters that translate request/response to module inputs/outputs.
  - Move stateful policy (attempt counters, cooldowns, lockouts, expiry) behind a seam with at least two adapters (in-memory and durable store).
- **Benefits**
  - **Locality** improves: security policy and auth state transitions are concentrated.
  - **Leverage** improves: routes become straightforward adapters and are easier to reason about.
  - Tests improve with module-level behavior matrices (lockout, expiry, replay) independent of Express.

## Better alternatives to smooth adoption

1. Start with Candidate 3 first (Auth), because risk concentration and branching depth are highest there.
2. Use a strangler approach: wrap existing functions behind the new module interface before moving implementation.
3. Add characterization tests around current behavior before deepening modules to avoid accidental behavior drift.
4. Introduce one real seam early by adding a second adapter in a narrow area (e.g. in-memory + file-backed auth policy store), which validates that the seam is earning its keep.
