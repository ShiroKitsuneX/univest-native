# Anti-Patterns

## Purpose

This document lists dangerous growth patterns for this project.

Complexity is not the problem.
Unstructured complexity is the problem.

Each anti-pattern below includes the preferred organizational fix.

## 1. Scattered Firebase Logic

### What It Looks Like

- `setDoc`, `getDocs`, `updateDoc`, `deleteDoc`, or `collection` imports inside screens, modals, or `App.js`
- repeated document paths such as `"usuarios"` and `"posts"` across unrelated files

### Why It Is Dangerous

- the real write path becomes impossible to find
- different AI tools implement the same backend action differently
- one field can be updated by several files with inconsistent logic

### Current Evidence In This Project

- `App.js`
- `src/screens/onboarding/OnboardingScreen.js`
- `src/screens/feed/FeedScreen.js`
- `src/screens/perfil/PerfilScreen.js`
- `src/screens/explorar/BooksListScreen.js`
- `src/screens/explorar/UniversityDetailScreen.js`
- `src/modals/GoalsModal.js`

### Proper Fix

Move all Firebase access into repositories and call them through services or store actions.

## 2. Mixed Persistence Paths

### What It Looks Like

The same user-related data is persisted through:

- `persistToUser`
- `saveLocalUserData`
- direct Firestore `setDoc`

### Why It Is Dangerous

- duplicate writes
- race conditions
- unclear source of truth
- harder rollback behavior
- weaker AI tools may add a fourth persistence path

### Proper Fix

Choose one official persistence path per domain:

- local-only UI preferences
- store-managed user profile sync
- repository-managed remote actions

Never mix them casually.

## 3. UI Files Owning Business Transactions

### What It Looks Like

A screen both:

- renders UI
- performs optimistic updates
- talks to Firebase
- handles rollback
- updates local storage

### Why It Is Dangerous

The screen becomes fragile and difficult to extend.
Every new behavior increases the chance of regressions.

### Current Evidence In This Project

- feed like/share/report behavior in `src/screens/feed/FeedScreen.js`
- follow/unfollow orchestration in `App.js`
- read-books persistence logic in profile and explore screens

### Proper Fix

Move business transactions into service or store actions.
Let the UI trigger named actions only.

## 4. Root Component As A Coordination Hub

### What It Looks Like

`App.js` owns:

- auth branching
- onboarding branching
- page switching
- modal wiring
- store hydration
- some backend updates

### Why It Is Dangerous

The root file becomes a hidden dependency for unrelated features.
Low-context AI tools will continue placing logic there because it appears central and convenient.

### Proper Fix

Move routing to real navigators.
Move feature actions into services/stores.
Keep `App.js` focused on bootstrap and providers.

## 5. Boolean Navigation State Growth

### What It Looks Like

State such as:

- selected tab
- page booleans
- modal booleans
- selected detail entity

is used as a manual routing system.

### Why It Is Dangerous

- hard back-navigation behavior
- hard deep linking
- accidental impossible states
- feature additions require editing the root coordinator

### Proper Fix

Use React Navigation stacks and tabs for screen-level navigation.
Use local state only for genuine local overlays.

## 6. Inconsistent Naming And Heavy Abbreviation

### What It Looks Like

Variables such as:

- `c1`
- `c2`
- `gs`
- `av`
- `selUni`

### Why It Is Dangerous

Humans can learn local abbreviations.
Weak AI tools frequently misread them, duplicate them, or use them inconsistently.

### Proper Fix

Prefer explicit names in all new code.
Rename old abbreviated fields only when touching the relevant domain carefully.

## 7. Duplicate Or Drifting Structure

### What It Looks Like

- empty duplicate folders
- similar concepts stored in different directories without a rule
- docs and naming conventions drifting over time

### Current Evidence In This Project

- empty `src/screens/ExplorarScreen`
- empty `src/screens/FeedScreen`
- empty `src/screens/NotasScreen`
- empty `src/screens/PerfilScreen`
- lowercase docs such as `docs/app_flow.md` while new docs are being standardized separately

### Why It Is Dangerous

AI tools use folder shape as guidance.
Dead folders and inconsistent naming create false signals and future duplication.

### Proper Fix

Remove empty duplicate folders.
Define one naming convention and follow it consistently.

## 8. Shared Data Without Clear Ownership

### What It Looks Like

The app mixes:

- static data files
- fetched Firebase data
- hydrated local data

without clear ownership rules.

### Why It Is Dangerous

It becomes unclear whether a field is:

- editable
- cached
- seeded
- authoritative

### Proper Fix

For every domain, define:

- source of truth
- fallback source
- cache policy
- write owner

## 9. Repeated Query Logic

### What It Looks Like

The same data is fetched or derived in multiple places with slightly different logic.

### Why It Is Dangerous

- inconsistent results
- cost growth
- subtle bugs
- duplication across AI-generated patches

### Proper Fix

Create one repository function per query shape and one selector per derived view.

## 10. Premature Over-Modularization

### What It Looks Like

Splitting a very small feature into too many files before the boundaries are real.

### Why It Is Dangerous

- more files to scan
- more AI confusion
- less obvious ownership

### Proper Fix

Keep simple features compact.
Split only when a second responsibility appears.

## 11. Large Files With Mixed Responsibilities

### What It Looks Like

A large file contains:

- UI
- remote writes
- navigation logic
- local persistence
- feature rules

### Why It Is Dangerous

Large files are not automatically bad.
Large mixed-responsibility files are bad.

### Proper Fix

Keep large files only when they have one clear responsibility.
If a file contains multiple workflows, split by responsibility.

## 12. Inaccurate Project Documentation

### Current Evidence In This Project

`README.md` still reflects Create React App rather than the actual Expo/React Native app.

### Why It Is Dangerous

Humans and AI tools both use docs as architectural guidance.
Incorrect docs create incorrect code.

### Proper Fix

Update docs whenever core structure changes.
Treat architecture docs as part of the codebase, not optional notes.

## Final Rule

Do not reject complexity.
Reject hidden responsibility, repeated logic, and unclear ownership.
