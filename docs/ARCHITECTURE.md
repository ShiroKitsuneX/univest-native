# Architecture Guide

## Purpose

This document defines the target architecture for Univest Native.

The goal is not to make the codebase artificially small.
The goal is to make growth predictable, easy to inspect, and safe for multiple AI tools working with limited context.

## Current Project Analysis

The project already has good foundations:

- `src/screens`, `src/components`, `src/services`, `src/stores`, `src/utils`, and `src/firebase` exist.
- Zustand is already being used for shared state.
- Firebase is already initialized centrally in `src/firebase/config.js`.
- Some logic has already moved out of `App.js`.

The current structural risks are:

- `App.js` still acts as a root coordinator for auth, onboarding, tab switching, modal orchestration, hydration, and some Firebase writes.
- React Navigation exists, but `src/navigation/RootNavigator.js` is still only a single-screen wrapper.
- Firebase writes are scattered across `App.js`, screens, modals, services, and middleware.
- Persistence is split between local storage, store middleware, and direct Firestore writes.
- Empty duplicate folders exist under `src/screens/ExplorarScreen`, `FeedScreen`, `NotasScreen`, and `PerfilScreen`.
- Naming is inconsistent in some places and often abbreviated (`c1`, `c2`, `gs`, `av`, `selUni`), which is easy for weaker AI tools to misuse.
- `README.md` is still a Create React App template and does not describe the actual Expo/React Native project.

## Architectural Principles

1. UI renders data and triggers actions.
2. Business logic decides what should happen.
3. Firebase code performs remote reads and writes.
4. Shared state stores app state, not raw Firebase logic.
5. Static data and remote data must have explicit ownership.
6. Simple features may stay compact, but the boundaries must stay the same.
7. Complex features may have large files, but only when the responsibility is clear.

## Recommended Target Structure

```text
src/
  app/
    AppBootstrap.js
    AppProviders.js
    navigation/
      RootNavigator.js
      AuthStack.js
      OnboardingStack.js
      MainTabs.js

  core/
    config/
      env.js
      constants.js
    firebase/
      client.js
      authClient.js
      firestorePaths.js
      mappers/
    storage/
      localUserStorage.js
    errors/
      appError.js

  features/
    auth/
      screens/
        WelcomeScreen.js
      components/
      hooks/
        useAuthActions.js
      services/
        authService.js
      repositories/
        authRepository.js
        userRepository.js
      store/
        useSessionStore.js

    onboarding/
      screens/
        OnboardingScreen.js
      components/
      hooks/
      services/
        onboardingService.js
      store/
        useOnboardingStore.js

    feed/
      screens/
        FeedScreen.js
      components/
        StoriesStrip.js
        StoryViewer.js
      hooks/
        useFeedScreenData.js
      services/
        feedService.js
      repositories/
        postsRepository.js
        reportsRepository.js
      store/
        useFeedStore.js

    explorar/
      screens/
        ExplorarScreen.js
        FollowingScreen.js
        BooksListScreen.js
        ExamsListScreen.js
        UniversityDetailScreen.js
      components/
      hooks/
      services/
        universityService.js
      repositories/
        universitiesRepository.js
      store/
        useExploreStore.js

    notas/
      screens/
        NotasScreen.js
      components/
      hooks/
      services/
        gradesService.js
      store/
        useGradesStore.js

    profile/
      screens/
        PerfilScreen.js
      components/
      modals/
      hooks/
      services/
        profileService.js
      repositories/
        profileRepository.js
      store/
        useProfileStore.js

  shared/
    components/
      Chip.js
      EmptyState.js
      SBox.js
      BottomSheet.js
    theme/
      palette.js
      avatar.js
    data/
      areas.js
      constants.js
      events.js
      feed.js
      geo.js
      notasCorte.js
      stories.js
      subjects.js
      universities.js
      userTypes.js
    hooks/
    utils/
      dates.js
      filter.js
      format.js
      goals.js
      string.js
      validation.js
```

## Layer Responsibilities

### UI Layer

Files:

- `screens/`
- `components/`
- `modals/`

Rules:

- May read from stores and call hooks/actions.
- May own ephemeral state like search text, picker state, open/closed UI state, focused tab section, local form input, and animation flags.
- Must not import Firebase SDK directly.
- Must not assemble Firestore document paths.
- Must not contain cross-collection write logic.

### Business Logic Layer

Files:

- `services/`
- `hooks/`
- store actions when the logic is truly state-specific

Rules:

- Converts UI intent into application behavior.
- Coordinates optimistic updates, rollback, validation, and multi-step flows.
- Calls repositories, not Firebase SDK directly.
- Can be simple for small features and more structured for complex ones.

### Firebase Integration Layer

Files:

- `core/firebase/*`
- `features/*/repositories/*`

Rules:

- Owns document paths, queries, reads, writes, batching, transactions, and mapping.
- Returns clean app-shaped data.
- No React state inside repositories.
- No Alert, modal, navigation, or UI formatting inside repositories.

## State Management Standard

Use Zustand, but split state by responsibility.

### App-Level Stores

Use app-level stores only for truly cross-app state:

- session/auth
- onboarding status
- theme if it is global
- cached remote collections shared by multiple screens

### Feature Stores

Use feature stores for state shared inside one feature:

- feed liked/saved state
- profile progress data
- explore filters if reused across explore screens

### Local Component State

Keep local state in the component when it is temporary and screen-specific:

- search input
- accordion expansion
- selected local picker option
- modal visibility owned by one screen
- transient edit drafts

### State Management Rules

1. A store may call a service action.
2. A store should not import raw Firebase SDK.
3. A store should expose clear actions with full names.
4. Derived state should be computed via selectors or helper functions, not duplicated in multiple screens.
5. Remote loading state must be explicit: `idle`, `loading`, `success`, `error`.

## Firebase Call Structure

Use this chain:

```text
Screen/Modal
  -> feature hook or store action
  -> feature service
  -> repository
  -> Firebase SDK
```

Example:

```text
FeedScreen
  -> useFeedActions().toggleLike(postId)
  -> feedService.toggleLike(postId, userId)
  -> postsRepository.setPostLike(postId, userId, liked)
  -> Firestore write
```

## Authentication Structure

Authentication must be split into three parts:

1. `authRepository`
   - Wraps Firebase Auth methods.
2. `authService`
   - Handles sign in, sign up, logout, password reset, session bootstrap, and user document initialization.
3. `useSessionStore`
   - Stores `currentUser`, `sessionStatus`, `profile`, `onboardingStatus`, and exposes bootstrap actions.

The root navigator must branch based on store state:

```text
loading -> Splash
signed out -> AuthStack
signed in but onboarding incomplete -> OnboardingStack
signed in and ready -> MainTabs
```

Do not keep this routing logic inside `App.js` conditionals long term.

## Naming Conventions

### Files

- Components: `PascalCase.js`
- Screens: `PascalCaseScreen.js`
- Hooks: `useSomething.js`
- Stores: `useSomethingStore.js`
- Services: `somethingService.js`
- Repositories: `somethingRepository.js`
- Firebase-only helpers: `somethingClient.js` or `firestorePaths.js`
- Static data: `somethingData.js` only when the file is clearly static

### Variables

Prefer full names over abbreviations:

- `primaryCourse` instead of `c1`
- `secondaryCourse` instead of `c2`
- `selectedUniversity` instead of `selUni`
- `grades` instead of `gs`
- `avatar` instead of `av`

Short names are acceptable only inside tiny local scopes.

### Exports

- Prefer named exports for shared modules.
- Use one main exported screen/component per file.

## File Organization Standards

### Keep Code Together When

- The feature is small.
- The file has one obvious responsibility.
- Splitting would create artificial indirection.
- The logic is only used by one screen.

Examples:

- A 250-line screen with local form state and display logic.
- A modal with local picker state and one submit action.
- A small repository with 3-5 related Firestore functions.

### Split Code When

- A file mixes rendering, domain rules, and Firebase calls.
- The same query or write logic is repeated in multiple files.
- A screen owns more than one independent workflow.
- The same mapping/transformation appears in multiple places.
- Navigation state and feature state become intertwined.

Split by responsibility, not by line count alone.

## Simple Feature Standard

A simple feature may use:

- one screen
- one local hook or a few inline helpers
- one store if shared state is needed
- one repository file if Firebase is involved

Target flow:

```text
screen -> service/repository -> store update -> render
```

## Complex Feature Standard

A complex feature may include:

- multiple screens
- reusable feature components
- a store
- selectors
- a service layer
- one or more repositories
- mappers between Firestore and app models

Target flow:

```text
screens
  -> feature hooks/actions
  -> services
  -> repositories
  -> store state
  -> selectors
  -> UI
```

Complexity is acceptable when the feature is difficult.
Disorder is not acceptable.

## Recommended Migration Direction

Do not perform a massive rewrite.
Move progressively in this order:

1. Stop adding new direct Firebase calls in screens and modals.
2. Move repeated Firestore writes into repositories and services.
3. Move root app routing into real navigators.
4. Clean duplicated empty screen folders.
5. Standardize naming in new code first, then rename old abbreviations when touching related files.
6. Replace inaccurate project docs starting with `README.md`.

## Non-Negotiable Rules

1. No Firebase SDK imports in screens, components, or modals.
2. No duplicated query definitions across features.
3. No new global store without clear cross-screen need.
4. No route state implemented as a growing set of booleans.
5. No feature may write user data to Firestore in more than one architectural path.
