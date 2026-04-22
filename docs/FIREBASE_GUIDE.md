# Firebase Guide

## Purpose

Firebase is a core platform dependency for Univest Native.

This guide defines:

- where Firebase code may live
- which modules own which collections
- how reads, writes, fallbacks, and caches must be organized
- how to avoid cost, duplication, and permission drift

## Current Repo Assessment

The codebase is in a hybrid state.

### Already Good

- `src/core/firebase/firestorePaths.ts` exists
- feature repositories already exist for:
  - feed
  - explore
- story loading is already moving through feature services
- institution updates already use an explore repository and service

### Remaining Debts

- `src/services/firestore.ts` still centralizes several unrelated query families
- `src/stores/middleware/persistToUser.ts` still performs remote writes from infrastructure middleware
- root-level services still mix temporary legacy responsibilities with domain logic

### Recently Fixed

- OnboardingScreen now uses onboardingService/repository
- App.tsx toggleFollow now uses universityService

This guide must support the current code while forcing all new work toward a cleaner end state.

## Firebase Ownership Rule

Firebase SDK imports are allowed only in:

- `src/core/firebase/*`
- `src/features/*/repositories/*`
- `src/reference/*/repositories/*`
- temporary migration files already doing this work today

Firebase SDK imports are not allowed in:

- screens
- components
- modals
- navigation files
- generic utils
- new store files

### Exception

`persistToUser` is an existing infrastructure exception.
It is tolerated for now because it centralizes repeated persistence.
It must not become the default place for new domain-specific remote behavior.

New multi-step or domain-sensitive writes must go through repositories and services.

## Approved Request Flow

For reads:

```text
UI
  -> store or feature hook
  -> service if orchestration is needed
  -> repository
  -> Firebase
```

For writes:

```text
UI intent
  -> store action or feature hook
  -> service
  -> repository
  -> Firebase
  -> state reconciliation
```

## Collection Ownership Map

Every collection must have a clear owner.

### `usuarios`

Purpose:

- auth-linked user profile
- onboarding completion
- followed universities
- planning state
- profile preferences
- institution account metadata

Primary domains:

- auth
- onboarding
- profile
- planning

Rules:

- do not let every feature write arbitrary partials to `usuarios`
- group writes by domain intent
- fields like `tipo` and `linkedUniId` are identity/session fields, not generic profile preferences

### `universidades`

Purpose:

- university catalog
- institution-editable profile data
- follower counts
- books and exams metadata

Primary domains:

- explore
- institution

Rules:

- student-facing reads belong to explore repositories
- institution-admin writes belong to institution/explore repositories
- follower counter logic must stay centralized

### `universidades/{uniId}/stories`

Purpose:

- institution stories
- feed story strip

Primary domains:

- feed
- institution

Rules:

- loading belongs to feed repositories
- creation and moderation should belong to institution repositories/services when added

### `posts`

Purpose:

- feed content
- share count
- like count

Primary domain:

- feed

### `posts/{postId}/likes`

Purpose:

- per-user like state

Primary domain:

- feed

### `reports`

Purpose:

- moderation/report pipeline

Primary domain:

- feed

### `cursos` and `icones`

Purpose:

- reference catalogs

Primary owner:

- reference catalog repositories

### `countries`, `states`, `cities`

Purpose:

- geo reference catalogs

Primary owner:

- reference geo repositories

## Firestore Path Rule

All document and collection path construction must go through centralized helpers.

Current approved helper:

- `src/core/firebase/firestorePaths.ts`

Rules:

1. never hardcode repeated collection names in UI code
2. never rebuild nested paths ad hoc in screens
3. add new path helpers before adding new repositories

## Domain Field Ownership Inside `usuarios`

The user document is currently multi-purpose.
That is acceptable for now, but ownership must stay explicit.

### Session/Auth Fields

Examples:

- `tipo`
- `linkedUniId`
- `email`

Owner:

- auth domain

### Onboarding Fields

Examples:

- `done`
- `uTypeId`
- `c1`
- `c2`
- `followedUnis`

Owner:

- onboarding domain

### Profile Preference Fields

Examples:

- `theme`
- `av`
- `avBgIdx`
- `nome`
- `sobrenome`
- location fields

Owner:

- profile domain

### Planning Fields

Examples:

- `goalsUnis`
- `readBooks`
- `completedTodos`

Owner:

- planning domain

The existence of one shared document does not remove domain ownership.

## Read Strategy

### Rule 1: One Query Shape, One Repository Function

Examples:

- `listFeedPosts()`
- `listUniversities()`
- `getUserProfile()`
- `listStoriesForFollowedUniversities()`

Do not redefine the same query in several files.

### Rule 2: Repositories Return App Shapes

Repositories must:

- map document snapshots
- normalize ids
- sort where appropriate
- hide Firestore-specific quirks

Screens and stores should not need to understand `DocumentSnapshot`, `toMillis`, or nested Firestore path details.

### Rule 3: Fallbacks Belong Below The UI

When the app needs fallback local data:

- repositories or store loaders decide how fallback is applied
- screens consume the final prepared dataset

Do not let screens decide whether data is “remote” or “seed”.

## Write Strategy

Every write must be represented by a named domain action.

Good examples:

- `completeOnboarding`
- `togglePostLike`
- `reportPost`
- `followUniversity`
- `updateUniversityInfo`
- `updateReadBooks`

Bad examples:

- `setDoc` called directly from a screen
- raw partial writes assembled ad hoc in multiple files
- counter updates in one file while array updates live elsewhere

## Transaction And Batch Rule

Use a transaction or batch when a write must keep multiple documents logically aligned.

Examples:

- following/unfollowing a university
  - user document state
  - university follower count
- future institution publishing flows
  - publish record
  - moderation state
  - analytics counters

If consistency matters across documents, do not rely on unrelated separate writes from UI code.

## `persistToUser` Policy

`persistToUser` currently exists and is useful, but it is also a hidden remote side-effect layer.

### Allowed Use During Migration

- low-risk user preference slices
- clearly scoped cache synchronization
- fields already standardized in existing stores

### Not Appropriate For

- sensitive identity logic
- multi-document transactions
- permission-sensitive institution writes
- counters and moderation actions
- flows that require validation beyond “save this slice”

### Long-Term Direction

Move high-importance user document writes toward explicit domain repositories and services.
Keep middleware persistence for simple, well-bounded slices only if it remains predictable.

## Authentication Rules

1. auth listener logic lives in one bootstrap/session flow
2. user document initialization belongs to auth repositories/services, not UI
3. account mode checks (`usuario` vs `instituicao`) are part of session state
4. institution permissions must never be inferred only from UI state

## Institution Mode Rules

Institution mode changes Firebase requirements.

### Required Rules

1. institution users may only edit their linked university
2. `linkedUniId` ownership must be enforced by backend rules, not only by client code
3. student-facing and institution-facing write paths must stay separate
4. future post/story creation should use institution-owned repositories, not reuse student profile persistence paths

## Cost And Performance Rules

The app currently loads several full collections.
This is acceptable at the current scale, but the architecture must anticipate growth.

### Required Practices

1. load shared reference catalogs once and cache them
2. add pagination for growing feed collections
3. avoid duplicate loads from multiple screens
4. track loading/error state explicitly
5. use `serverTimestamp()` for remote timestamps where ordering matters
6. avoid downloading wide datasets only to filter almost everything locally when a targeted query is possible
7. keep counters centralized
8. plan indexes intentionally as query patterns stabilize

## Security And Rules Guidance

For long-term robustness, backend rules must match architectural ownership.

Priority areas:

- institution users can only update allowed fields for their `linkedUniId`
- users can only write their own likes, saved state, and planning state
- sensitive counters should not be freely mutable by unrelated clients
- moderation/report collections should be append-only for standard users

## Current Highest-Priority Cleanup

1. move onboarding completion write out of `OnboardingScreen.tsx`
2. stop expanding `src/services/firestore.ts` as a generic backend bucket
3. decide which `usuarios` fields remain middleware-persisted and which must move to explicit domain repositories
4. keep all new collection access behind path helpers and repositories

## Final Rule

The best Firebase architecture for this app is not “all Firebase in one file”.
It is “one explicit backend owner per domain action, with zero ambiguity about where a read or write belongs”.
