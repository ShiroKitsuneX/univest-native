# Development Guide

## Purpose

This guide defines how to build or extend Univest Native safely.

It is optimized for:

- human contributors
- high-context AI tools
- low-context AI tools that need explicit procedural rules

## Mandatory First Step

Before changing code, always inspect:

1. `docs/APP_MAP.md`
2. the relevant feature screen
3. the relevant store
4. the relevant service
5. the relevant repository
6. any related modal
7. any related seed or catalog data

If you skip this step, you are likely to break a product invariant or duplicate an existing pattern.

## Task Classification Template

Every task should be classified before implementation.

Use this template:

```text
Feature or fix:
Account type affected: common / institution / both
Primary domain: auth / onboarding / feed / explore / notes / profile / planning / institution / reference
Behavior change or structural change:
Remote entities touched:
Reference data touched:
Shared state touched:
Modal or route touched:
Docs to update:
```

## Product Invariants You Must Check

These are mandatory checks from `APP_MAP.md`.

1. Is this about followed universities or goal universities?
2. Is this about notes or planning goals?
3. Is this for a common user, an institution user, or both?
4. Is the source of truth remote, local fallback, cached local state, or ephemeral UI state?
5. Does this affect a modal workflow that is actually a core feature surface?

Do not code until these answers are explicit.

## Standard Implementation Flow

Use this order:

```text
classify task
-> inspect existing code
-> define domain action
-> implement or reuse repository
-> implement or reuse service
-> connect store or hook
-> connect UI
-> verify flow
-> update docs
```

## Where New Code Should Go

### New Product Logic

Prefer:

- `src/features/*`

### New Infrastructure

Prefer:

- `src/app/*`
- `src/core/*`

### New Reference Catalog Logic

Prefer:

- `src/reference/*` as the target direction
- while migrating, use the nearest existing catalog store/service only if the new code clearly belongs there

### What Not To Do

- do not create new domain-heavy helpers in a generic `src/services/` file if a feature module already exists
- do not add new Firebase logic inside screens or modals
- do not create another root-level “misc” folder

## How To Create A New Feature

### Step 1: Define The User Problem

Example:

```text
Feature: institution can publish stories
Account type: institution
Primary domain: institution + feed
Remote entities: universidades/{uniId}/stories
Shared state: story list refresh
```

### Step 2: Find The Domain Owner

Ask:

- which screen owns the UI?
- which feature owns the business rules?
- which repository should own the backend access?
- which store or selector should expose the state?

### Step 3: Create The Backend Contract First

Example:

```ts
export async function createUniversityStory(input: {
  universityId: string
  imageUrl: string
  createdBy: string
  expiresAt: string
}): Promise<void> {
  // repository implementation
}
```

### Step 4: Add Service Orchestration

Use a service when you need:

- validation
- optimistic updates
- rollback
- multi-step writes
- domain-specific rules

### Step 5: Connect State

Use:

- a feature store if the state is reused across screens
- local component state if the state is only view-local

### Step 6: Connect The UI

The UI should:

- read store data
- call named actions
- render success/error/loading states

The UI should not:

- assemble Firebase paths
- call raw Firebase methods
- decide cross-domain persistence rules

## How To Extend An Existing Feature Safely

Before creating anything new, check in this order:

1. existing screen
2. existing modal
3. existing store action
4. existing repository method
5. existing selector or helper
6. existing seed/reference data

Use this reuse order:

1. reuse as-is
2. extend the current module
3. extract a shared helper
4. create a new module only when the existing one is the wrong owner

## How To Handle Hybrid Architecture During Migration

The current repo has both:

- root-level services and stores
- feature repositories and services

Use these rules:

### Rule 1

If a feature already has `features/<domain>/repositories`, add new backend logic there.

### Rule 2

If the behavior still lives in a legacy root module, you may touch that file, but do not let it grow into a permanent dumping ground.

### Rule 3

When moving logic from legacy to feature modules, migrate one behavior at a time.

Good:

- move onboarding completion write
- keep UI unchanged
- verify

Bad:

- rewrite onboarding UI
- rename fields
- change routing
- change persistence

all at once

## How To Connect UI -> Logic -> Firebase

Approved chain:

```text
UI event
  -> store action or feature hook
  -> service
  -> repository
  -> Firebase
  -> store reconciliation
  -> rerender
```

### Example: Student Follows A University

```text
UniversityDetailScreen
  -> useExploreStore.followUniversity
  -> universityService.followUniversity
  -> universitiesRepository.followUniversity
  -> update user follow list + university follower count
```

### Example: Institution Updates University Description

```text
InstitutionAdminScreen
  -> institution store or handler
  -> universityService.updateUniversityInfo
  -> universitiesRepository.updateUniversityField
  -> update store selection/cache
```

## How To Work With Seed Data And Remote Data

This app intentionally uses fallback local data for resilience.

Use these rules:

1. decide the authoritative source first
2. document fallback behavior explicitly
3. keep fallback merging below the UI layer
4. never silently replace authoritative remote data with seed data in a screen

Examples:

- feed may fall back to local seeded posts
- universities may merge remote records with local books/exams metadata
- notes cut-off data may remain local until remote data exists

## Special Rules For Institution Mode

When touching institution flows, always verify:

1. the feature is really institution-only, student-only, or shared
2. the permission model is clear
3. student flows are not accidentally affected
4. the feature does not reuse student persistence paths by accident

Do not hide institution behavior inside generic profile logic if it deserves a dedicated owner.

## Safe Refactor Checklist

Before merging a structural change:

1. confirm the domain owner is clearer than before
2. confirm there is not a second source of truth
3. confirm product invariants from `APP_MAP.md` still hold
4. confirm account mode branching still works
5. confirm loading and fallback behavior still works
6. confirm document paths are still centralized

## Verification Checklist

Every meaningful change should verify the relevant flows.

### Global

- bootstrap
- splash/loading path
- logged-out experience

### Common User

- login/signup/reset if touched
- onboarding if touched
- feed
- explore
- notes
- profile/planning

### Institution User

- profile tab switches to institution admin
- linked university loads correctly
- allowed edits persist correctly

### Persistence

- remote save succeeds
- local cache survives reload if expected
- no duplicate write path was introduced

## When To Update Documentation

Update `APP_MAP.md` when:

- feature behavior changes
- route structure changes
- account mode changes
- store ownership changes
- a new major modal or screen is added

Update architecture docs when:

- a new structural pattern is introduced
- a legacy pattern is removed
- domain ownership changes

## Done Definition

A task is complete only when:

1. product invariants were checked
2. code was placed in the correct owner
3. Firebase access is organized correctly
4. duplicated logic was avoided
5. verification was performed
6. docs were updated if the behavior or structure changed

## Final Rule

Do not optimize for “fastest patch”.
Optimize for “next contributor can extend this without guessing”.
