# Architecture Standard

## Purpose

This document defines the architecture standard for Univest Native.

It must be readable by:

- human developers
- strong AI coding tools
- low-context AI tools
- non-programmer maintainers reviewing generated code

The architecture must therefore optimize for:

- explicit ownership
- deterministic file placement
- controlled complexity
- low ambiguity
- progressive migration instead of large rewrites

## Source Of Truth Hierarchy

For architecture decisions, use this order:

1. `docs/APP_MAP.md`
   - product behavior, feature scope, account modes, domain invariants
2. `docs/ARCHITECTURE.md`
   - code organization, ownership, layering
3. `docs/FIREBASE_GUIDE.md`
   - backend access rules
4. `docs/COUNTERS.md`
   - source-of-truth + reconcile rules for likes / follows / shares
5. `docs/DEVELOPMENT_GUIDE.md`
   - implementation workflow
6. `docs/ANTI_PATTERNS.md`
   - what must not be introduced

If product behavior and folder organization seem to conflict, `APP_MAP.md` decides the product truth and this document decides how that truth must be implemented.

## Current Codebase Assessment

The codebase is already in a meaningful transition toward a better structure.

### What Is Already Good

- real navigation now exists in `src/navigation/RootNavigator.tsx`, `MainTabs.tsx`, and `ExplorarStack.tsx`
- bootstrap logic has been extracted into `src/app/useBootstrap.ts`
- the app already uses Zustand with domain stores
- some Firebase access is already centralized through:
  - `src/core/firebase/firestorePaths.ts`
  - `src/features/feed/repositories/*`
  - `src/features/explorar/repositories/*`
- institution mode is already real and not just planned
- an `ErrorBoundary` exists
- path aliases with `@/` are already in use
- most app UI code is already in TypeScript/TSX

### Current Structural Debts

- architecture is hybrid: root-level `services/` and `stores/` still coexist with feature repositories and services
- `persistToUser` still performs remote writes from store infrastructure (kept by policy — see FIREBASE_GUIDE)
- `src/services/auth.ts` retains only the Firebase Auth wrappers; the signUp profile write now lives in `features/auth/repositories/authRepository.createInitialUserProfile`
- feature-owned modals now live under their feature folder (`src/features/<domain>/modals/`); only `SettingsModal` (app-shell composition) and `ShareModal` (cross-feature) remain in the global `src/modals/`
- `ErrorBoundary` now lives at `src/core/errors/ErrorBoundary.tsx`; `logger` at `src/core/logging/logger.ts`; user-storage helpers at `src/core/storage/localUserStorage.ts`
- the repo still mixes `.js`, `.ts`, and `.tsx` — only `src/data/*` remain `.js`
- folder name drift: `features/explorar` (PT) vs target `features/explore` (EN); `screens/notas` exists with no matching `features/notes`. Pick one convention and migrate the rest at touch time
- ESLint is on v8.57 with `.eslintrc.json` and `npm run lint` runs clean (0 errors). A future bump to v9 will require migrating to flat config (`eslint.config.js`)
- some naming remains highly abbreviated and easy for AI tools to misread

### Recently Fixed

- OnboardingScreen now uses onboardingService/repository
- toggleFollow in App.tsx now uses universityService
- Empty duplicate screen directories deleted

This document must support the current hybrid state while also making the next migration steps explicit.

## Architecture Style

Use a **hybrid feature-first layered architecture**.

That means:

- the codebase is organized primarily by product domain
- each domain still respects clear layers
- shared infrastructure stays out of product feature folders
- temporary legacy modules are tolerated during migration, but new code should not expand them

The layers are:

1. `app`
   - bootstrapping, providers, navigation shell, top-level composition
2. `core`
   - infrastructure that is not product-specific
3. `features`
   - product domains and workflows
4. `reference`
   - shared catalogs, lookups, fallback seed datasets, and reference data loading
5. `shared`
   - pure UI primitives, theme, hooks, and stateless utilities

## Recommended Target Structure

```text
src/
  app/
    bootstrap/
      useBootstrap.ts
    navigation/
      RootNavigator.tsx
      MainTabs.tsx
      ExplorarStack.tsx
      mainContext.ts
    providers/
    composition/

  core/
    firebase/
      firestorePaths.ts
      client.ts
      authClient.ts
      storageClient.ts
    storage/
      localUserStorage.ts
    logging/
      logger.ts
    errors/
      ErrorBoundary.tsx

  features/
    auth/
      screens/
      services/
      repositories/
      hooks/
      types/

    onboarding/
      screens/
      services/
      repositories/
      store/

    feed/
      screens/
      components/
      services/
      repositories/
      selectors/
      store/

    explore/
      screens/
      components/
      services/
      repositories/
      selectors/
      store/

    notes/
      screens/
      services/
      selectors/
      store/

    profile/
      screens/
      components/
      services/
      repositories/
      store/

    planning/
      components/
      modals/
      services/
      repositories/
      selectors/
      store/

    institution/
      screens/
      components/
      services/
      repositories/
      store/

  reference/
    catalogs/
      repositories/
      stores/
    seed/
      areas.ts
      events.ts
      feed.ts
      geo.ts
      notasCorte.ts
      stories.ts
      subjects.ts
      universities.ts
      userTypes.ts

  shared/
    components/
    hooks/
    theme/
    utils/
```

## Current Repo Mapping

The repo does not fully match the target yet.
Use this mapping while migrating:

- `src/app/*` is already valid and should grow
- `src/core/firebase/*` is already valid and should grow
- `src/features/feed/*` and `src/features/explorar/*` are already valid and should grow
- `src/services/*` is legacy-compatible, but new domain logic should prefer feature services/repositories
- `src/stores/*` is currently the shared state home; new stores may remain here during migration, but ownership must still follow domains
- `src/modals/*` is temporary; feature-owned modals should gradually move into feature folders when touched
- `src/data/*` currently acts as reference seed data; over time this should be treated as `reference/seed`

## Bounded Contexts

The app has these primary product domains.
Each one should have a clear owner.

### 1. Auth And Session

Owns:

- login
- signup
- password reset
- auth listener
- common user vs institution user branching

Files should live under:

- `features/auth/*`
- `app/bootstrap/*`
- `app/navigation/*`

### 2. Onboarding And Identity Setup

Owns:

- academic profile type
- primary and secondary course
- initial followed universities
- completion state

Files should live under:

- `features/onboarding/*`

### 3. Feed And Stories

Owns:

- feed posts
- likes
- saves
- shares
- reports
- stories loading and viewer

Files should live under:

- `features/feed/*`

### 4. Explore And Universities

Owns:

- university discovery
- following list
- books list
- exams list
- university detail
- sort and preference rules for discovery

Files should live under:

- `features/explore/*`

### 5. Notes And Performance

Owns:

- grade history
- cut-off comparisons
- filters, charts, comparisons
- future admission calculators and simulators

Files should live under:

- `features/notes/*`

### 6. Profile And Planning

Owns:

- user profile identity
- avatar and theme
- read books
- completed tasks
- goals and planning views
- exam reminder generation (`features/planning/services/examRemindersService.ensureExamReminders`)
- settings and edit flows

Current code still mixes profile and planning. That is acceptable for now, but new planning-heavy logic should not keep inflating a generic profile layer forever — `features/planning/services/` is the correct home for new orchestration in this domain (the notifications repository it writes through stays in `features/feed/repositories/`, since that's the collection owner).

### 7. Institution Mode

Owns:

- institution-specific profile/admin view
- university self-edit actions
- institution post authoring (`features/institution/repositories/institutionPostsRepository`,
  `features/institution/services/institutionPostsService`,
  `features/institution/modals/CreatePostModal`)
- institution story publishing (`features/institution/services/institutionStoriesService`,
  `features/institution/modals/CreateStoryModal`; reuses
  `features/feed/repositories/storiesRepository` for `universidades/{uniId}/stories`)
- institution analytics aggregation (`features/institution/services/institutionAnalyticsService`)
  composes existing repositories — no new Firestore collections
- future institution admin settings, image uploads, and time-series analytics

Institution mode must be treated as its own domain, not a special case hidden inside student profile code.

### 8. Reference Catalogs

Owns:

- geo data
- courses
- icons
- static fallback universities
- seed feed/events/cut-off data
- user types and subject definitions

Reference data is not “misc data”.
It is a real system with its own ownership rules.

## Non-Negotiable Product Invariants

These come directly from `APP_MAP.md` and must be preserved in code organization.

### Followed Universities Are Not Goal Universities

- `followedUnis` drives feed, stories, and following lists
- `goalsUnis` drives planning, countdowns, and tasks

Never combine them into a single concept.

### Notes Are Not Goals

- notes represent historical performance
- goals represent future direction and planning

These domains may interact, but they are not the same state.

### Common User And Institution User Are Different Modes

- a common user receives student features
- an institution user receives administrative capabilities

Do not assume profile behavior is the same for both.

### Seed Data Is Not Automatically Authoritative

- local data is used for fallback, scaffolding, or catalog support
- Firebase data is the remote source of truth when available

The ownership and merge policy must be explicit.

### Modals Are First-Class Feature UI

In this app, many important workflows live in modals.
They are not secondary UI and should not be treated as generic leftovers.

## Layer Rules

### UI Layer

Includes:

- screens
- components
- modals

Rules:

- renders data
- triggers named actions
- owns ephemeral UI state
- may format data for presentation
- must not import Firebase SDK directly
- must not build remote document paths
- must not own multi-step business transactions

### Service Layer

Includes:

- feature services
- feature hooks that coordinate behavior

Rules:

- converts UI intent into domain actions
- coordinates optimistic updates and rollback
- validates invariants
- composes repository calls
- never owns final rendering

### Repository Layer

Includes:

- Firebase reads
- Firebase writes
- mapping to app shapes
- query ownership

Rules:

- one repository function per backend action or query shape
- no UI code
- no navigation code
- no React state

### Store Layer

Stores are allowed, but must be disciplined.

Rules:

- app-wide stores only for genuinely shared state
- feature stores for shared state inside one domain
- local screen state for temporary view-only behavior
- derived state belongs in selectors or memoized helpers, not duplicated in many screens

## State Taxonomy

Every piece of state must fit exactly one bucket.

### 1. Remote Authoritative State

Examples:

- user document
- universities
- posts
- stories
- geo catalog
- icons and courses

Owner:

- repositories + stores

### 2. Persisted Client State

Examples:

- theme
- avatar choices
- saved posts
- planning selections cached locally

Owner:

- store persistence infrastructure

### 3. Ephemeral UI State

Examples:

- search strings
- viewer index
- local edit text
- modal open/close state
- temporary selected chip

Owner:

- component or screen

### 4. Derived View State

Examples:

- filtered universities
- grouped stories
- upcoming exams from goals
- grade averages and chart series

Owner:

- selectors, helpers, or `useMemo`

## Navigation Standard

The navigation tree should reflect product structure, not internal convenience.

Current intended shape:

```text
Root
  -> Splash
  -> Welcome
  -> Onboarding
  -> Main

Main
  -> FeedTab
  -> ExplorarTab
    -> UniversityList
    -> UniversityDetail
    -> ExamsList
    -> BooksList
    -> Following
  -> NotasTab
  -> PerfilTab
    -> student profile view
    -> institution admin view
```

Rules:

- screen navigation uses React Navigation, not boolean state
- screen ownership follows the route tree
- modals may still be controlled by a shell, but their business logic must belong to the owning feature

## Modal Standard

Use three classes of modals:

1. feature modals
   - owned by one domain
2. app-shell modals
   - global wrappers launched from top-level navigation
3. shared primitives
   - reusable shell like `BottomSheet`

The current `src/modals/` folder is transitional.
When touching a modal that clearly belongs to one domain, prefer moving it under that feature instead of expanding the global bucket.

## Naming And File Standards

### Language

- technical code and documentation in English
- user-facing UI text may be Portuguese

### File Extensions

- new app code should be `.ts` or `.tsx`
- do not create new `.js` files in actively evolving app layers unless the file is purely static seed data or build configuration

### Imports

- use `@/` alias imports for internal modules
- avoid deep relative import chains when aliases are available

### Naming

Prefer explicit names:

- `primaryCourse`
- `secondaryCourse`
- `selectedUniversity`
- `readBooks`
- `completedTodos`

Avoid introducing new ambiguous abbreviations.

## When To Keep Code Together

Keep code together when:

- the file has one responsibility
- the workflow is contained to one screen or modal
- splitting would only create indirection

Large files are acceptable when the responsibility is still singular and obvious.

## When To Split Code

Split when:

- UI and remote writes live together
- more than one workflow grows in the same file
- multiple screens need the same transformation or selector
- product concepts with different invariants are mixed together
- a student flow and an institution flow begin to share a file awkwardly

## Testing And Observability Standard

Minimum expectations:

- utility logic should have tests
- selectors and mappers should be testable without UI
- infrastructure and repository failures should log through the shared logger
- app shell should remain wrapped in an error boundary
- manual regression checks must cover:
  - bootstrap
  - common user auth
  - institution auth
  - onboarding
  - feed
  - explore detail flows
  - notes
  - profile/planning

## Migration Priorities

The next architectural improvements should happen in this order:

1. decide whether to align `features/explorar` → `features/explore` (the rest of the codebase is English) and finish populating the new `features/notes/` and `features/planning/` owners (services + repositories beyond the modals already moved)
2. continue standardising active app layers on TypeScript (only `src/data/*.js` remain JS)
3. expand `tsconfig` to `strict: true` once the remaining ad-hoc `any` casts in store hydrate functions are typed
4. plan the ESLint v9 + flat-config migration when the next major bump happens

## Final Rule

The best organization for this app is not the most abstract one.
It is the one where every product behavior has one obvious home, one obvious owner, and one obvious way to extend it.
