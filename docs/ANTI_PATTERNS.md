# Anti-Patterns

## Purpose

This document lists growth patterns that damage the architecture of Univest Native.

Complexity is allowed.
Hidden ownership, duplicated behavior, and mixed concepts are not.

## 1. Scattered Firebase Logic

### What It Looks Like

- `setDoc`, `getDocs`, `updateDoc`, `deleteDoc`, or `collection` in screens or modals
- direct path strings repeated across unrelated files

### Why It Is Dangerous

- no single owner for backend behavior
- high chance of duplicated writes
- weak AI tools will copy the nearest example and spread the pattern

### Current Evidence

- `src/screens/onboarding/OnboardingScreen.tsx`

### Correct Direction

Move all new backend behavior to repositories and services.
Remove remaining UI-level Firebase access as the next cleanup step.

## 2. Generic Backend Buckets

### What It Looks Like

A file such as `src/services/firestore.ts` becomes the default place for every new query, regardless of domain.

### Why It Is Dangerous

- domains lose ownership
- feature boundaries blur
- repositories become half-finished

### Current Evidence

- `src/services/firestore.ts` still owns user, universities, posts, courses, icons, and likes reads

### Correct Direction

Move each query family to the owning feature or reference repository over time.

## 3. Hidden Remote Writes In Generic Middleware

### What It Looks Like

A generic store middleware writes to Firestore automatically when local state changes.

### Why It Is Dangerous

- remote side effects become implicit
- debugging write behavior becomes harder
- domain validation is bypassed

### Current Evidence

- `src/stores/middleware/persistToUser.ts`

### Correct Direction

Keep middleware persistence limited and explicit.
Move sensitive, multi-step, or domain-heavy writes to repositories/services.

## 4. Treating Student And Institution Accounts As The Same Domain

### What It Looks Like

- student profile and institution admin behavior share the same assumptions
- code assumes every authenticated user is a student

### Why It Is Dangerous

- wrong UI and wrong persistence rules
- product behavior drifts away from `APP_MAP.md`

### Current Evidence

- institution mode is real in `RootNavigator.tsx` and `MainTabs.tsx`, but many architecture docs previously treated it as future-only

### Correct Direction

Treat institution mode as a first-class domain with explicit ownership.

## 5. Mixing Followed Universities With Goal Universities

### What It Looks Like

Using one state shape or one piece of logic for:

- feed personalization
- planning and countdowns

### Why It Is Dangerous

These are different product concepts with different consequences.

### Product Rule

- `followedUnis` feeds feed/stories/following
- `goalsUnis` feeds planning/tasks/countdowns

### Correct Direction

Keep them separate in state, repositories, and UI language.

## 6. Mixing Notes With Goals

### What It Looks Like

Treating past performance and future objectives as one state system.

### Why It Is Dangerous

- user history becomes harder to reason about
- planning logic becomes harder to extend
- AI tools may incorrectly reuse one concept for the other

### Correct Direction

Keep:

- notes = historical performance
- goals = future planning

They may interact, but they must not collapse into one model.

## 7. Seed Data Without Explicit Ownership

### What It Looks Like

Local fallback data is used without a clear rule for whether it is:

- fallback
- seed
- reference catalog
- authoritative default

### Why It Is Dangerous

- screens begin making source-of-truth decisions
- merge behavior becomes inconsistent
- remote updates may appear to “not work”

### Current Evidence

- universities merge remote data with local books/exams
- feed can fall back to local seed posts
- notes cut-off data is local

### Correct Direction

Every domain must define:

- authoritative source
- fallback source
- merge owner
- cache policy

## 8. Modals As A Miscellaneous Bucket

### What It Looks Like

All important modal workflows live in one global folder with no domain ownership.

### Why It Is Dangerous

In this app, modals are core feature surfaces, not just helpers.

### Current Evidence

- major feature flows still live under `src/modals/*`

### Correct Direction

Gradually move feature-owned modals under their feature as they are touched.
Keep only shared modal shells globally.

## 9. Root Shell Or Navigation Layer Becoming A Logic Hub

### What It Looks Like

Navigation files or root app shell accumulate:

- domain business rules
- remote writes
- feature-specific workflow logic

### Why It Is Dangerous

Every feature becomes coupled to the app shell.

### Correct Direction

Keep `app/` and navigation focused on composition, branching, and screen wiring.
Push domain behavior down into features.

## 10. Empty Or Duplicate Structure

### What It Looks Like

- empty directories
- obsolete folder names
- duplicate structural signals

### Current Evidence

- `src/screens/ExplorarScreen`
- `src/screens/FeedScreen`
- `src/screens/NotasScreen`
- `src/screens/PerfilScreen`

### Why It Is Dangerous

AI tools treat folder structure as guidance.
Dead structure becomes bad guidance.

### Correct Direction

Delete empty duplicate folders and keep one naming convention.

## 11. Creating New JS Files In Active App Layers

### What It Looks Like

New logic is added in `.js` inside actively evolving app code while the repo is already mostly TypeScript in those layers.

### Why It Is Dangerous

- inconsistent typing guarantees
- harder refactors
- more room for low-context AI mistakes

### Current Evidence

- the repo currently mixes `.js`, `.ts`, and `.tsx`

### Correct Direction

Use `.ts` and `.tsx` for new app logic.
Limit `.js` to untouched seed/config areas until migrated.

## 12. Architecture Docs That Ignore The Product Map

### What It Looks Like

Architecture documentation describes only current folder layout and ignores real product modes, states, and invariants.

### Why It Is Dangerous

Developers then organize code in ways that violate actual product behavior.

### Current Evidence

Earlier architecture docs under-described:

- institution mode
- reference/fallback catalog ownership
- followed vs goal universities
- notes vs goals

### Correct Direction

Always align architecture rules with `APP_MAP.md`.

## 13. New Patterns Introduced Without Updating Docs

### What It Looks Like

- new feature folder pattern appears
- new store persistence rule appears
- new route structure appears

but the docs are not updated.

### Why It Is Dangerous

The next contributor copies outdated guidance.

### Correct Direction

Any meaningful structural change must update architecture docs in the same change set.

## 14. One State Slice Serving Multiple Concepts

### What It Looks Like

One store key or one document field starts serving several unrelated meanings because it is convenient.

### Why It Is Dangerous

- invisible coupling
- migration pain
- product bugs that are hard to spot

### Correct Direction

Each state slice must represent one concept with one owner.

## 15. Full-Collection Loading As A Permanent Default

### What It Looks Like

Every new feature loads entire collections because current datasets are small.

### Why It Is Dangerous

- cost growth
- slow startup
- harder pagination later

### Correct Direction

Shared catalogs may be fully loaded when appropriate.
Growing content domains like feed, stories, analytics, or opportunities should plan for targeted queries and pagination.

## Final Rule

Do not fight complexity with arbitrary simplification.
Fight it with explicit ownership, explicit boundaries, and explicit product invariants.
