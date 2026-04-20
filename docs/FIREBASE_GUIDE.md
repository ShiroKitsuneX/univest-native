# Firebase Guide

## Purpose

Firebase must be centralized.

This project already uses Firebase for authentication, Firestore, and potentially storage.
The main structural risk is not Firebase itself.
The risk is letting Firebase access spread into screens, modals, and ad hoc helpers until no one knows which file is the real source of truth.

## Current Project Analysis

Firebase access is currently distributed across multiple layers:

- `src/firebase/config.js`
- `src/services/auth.js`
- `src/services/firestore.js`
- `src/services/geo.js`
- `src/stores/middleware/persistToUser.js`
- `App.js`
- `src/screens/onboarding/OnboardingScreen.js`
- `src/screens/feed/FeedScreen.js`
- `src/screens/perfil/PerfilScreen.js`
- `src/screens/explorar/BooksListScreen.js`
- `src/screens/explorar/UniversityDetailScreen.js`
- `src/modals/GoalsModal.js`

This is the primary Firebase risk in the codebase.

## Centralization Rule

Firebase SDK usage is allowed only in these places:

```text
src/core/firebase/*
src/features/*/repositories/*
src/services/* only if the service file is acting as a repository wrapper during migration
```

Firebase SDK usage is not allowed in:

- screens
- components
- modals
- navigation files
- generic utilities
- Zustand stores

Stores may call services.
Services may call repositories.
Repositories may call Firebase.

## Standard Firebase Folder Design

```text
src/
  core/
    firebase/
      client.js
      authClient.js
      firestorePaths.js
      storageClient.js
      converters/
        userConverter.js
        postConverter.js

  features/
    auth/
      repositories/
        authRepository.js
        userRepository.js
    feed/
      repositories/
        postsRepository.js
        reportsRepository.js
    explorar/
      repositories/
        universitiesRepository.js
    profile/
      repositories/
        profileRepository.js
```

## Firestore Path Standard

All collection and document path knowledge must be centralized.

Example:

```js
// src/core/firebase/firestorePaths.js
export const firestorePaths = {
  user: (userId) => ["usuarios", userId],
  universities: () => ["universidades"],
  university: (universityId) => ["universidades", String(universityId)],
  posts: () => ["posts"],
  post: (postId) => ["posts", String(postId)],
  postLike: (postId, userId) => ["posts", String(postId), "likes", userId],
  reports: () => ["reports"],
};
```

Never rebuild these path strings in screens.

## Authentication Pattern

### Required Structure

```text
UI
  -> authService
  -> authRepository
  -> Firebase Auth
  -> userRepository
  -> Firestore user document
```

### Rules

1. Sign in and sign out live in `authService`.
2. Creating the initial user profile document lives in `authService` or `userRepository`, not in the screen.
3. Auth state subscription lives in one bootstrap flow only.
4. The session store receives app-shaped data, not raw Firebase snapshot objects.

### Example

```js
// features/auth/services/authService.js
export async function registerUser(input) {
  const credential = await authRepository.signUp(input.email, input.password);

  await userRepository.createUserProfile(credential.user.uid, {
    email: credential.user.email,
    firstName: input.firstName,
    lastName: input.lastName,
    onboardingCompleted: false,
    followedUniversityIds: [],
  });

  await authRepository.sendEmailVerification(credential.user);

  return credential.user;
}
```

## Database Read Pattern

Every read function must answer one clear domain question.

Good examples:

- `getUserProfile(userId)`
- `listUniversities()`
- `listPostsForFeed()`
- `getPostLikesForUser(postIds, userId)`
- `getGeoCatalog()`

Bad examples:

- `fetchEverything()`
- `loadData()`
- `queryStuff()`

### Read Function Template

```js
export async function listUniversities() {
  const snapshot = await getDocs(collection(db, "universidades"));

  return snapshot.docs.map((docItem) => mapUniversityDoc(docItem));
}
```

### Read Rules

1. Map Firebase data once in the repository.
2. Return consistent shapes.
3. Never make screens understand Firestore quirks.
4. Keep fallback static data outside the repository, unless the repository is explicitly responsible for fallback behavior.

## Database Write Pattern

Every write must be represented by a named domain action.

Good examples:

- `followUniversity(userId, universityId)`
- `unfollowUniversity(userId, universityId)`
- `togglePostLike(postId, userId, liked)`
- `saveOnboardingAnswers(userId, payload)`
- `updateReadBooks(userId, readBooks)`

Bad examples:

- writing a raw partial document from each screen
- calling `setDoc` directly from UI code
- updating counters in one file and arrays in another without a shared action

### Write Function Template

```js
export async function followUniversity({ userId, universityId, universityName }) {
  const batch = writeBatch(db);

  batch.set(
    doc(db, "usuarios", userId),
    {
      followedUniversityIds: arrayUnion(universityId),
      followedUniversityNames: arrayUnion(universityName),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  batch.set(
    doc(db, "universidades", String(universityId)),
    {
      followersCount: increment(1),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();
}
```

Multi-document writes must live in one place only.

## How To Avoid Duplicated Queries

### Rule 1: One Query, One Owner

If the app needs the same dataset in multiple places, create one repository function and reuse it.

Examples:

- `listUniversities()` should not exist in multiple files.
- `getUserProfile()` should not be rebuilt in auth, profile, onboarding, and App bootstrap separately.

### Rule 2: Cache at the Store Boundary

If multiple screens consume the same remote collection:

- load it once
- store it once
- derive filtered/sorted views locally

This is especially important for:

- universities
- feed posts
- geo data
- user profile

### Rule 3: Track Fetch State

Each shared remote store should track:

- `status`
- `lastFetchedAt`
- `error`
- `loadedOnce`

This avoids repeated queries caused by weaker AI tools adding `useEffect(() => load(), [])` in multiple screens.

### Rule 4: Reuse Selectors Before Requerying

If a screen needs:

- only followed universities
- only saved posts
- only upcoming exams

derive from existing store state first.
Do not fetch a second copy unless the backend query is materially different and cheaper.

## Reusable Firebase Function Standards

Each repository function must:

1. have a domain name
2. accept explicit arguments
3. return a stable shape
4. hide Firebase internals
5. own error translation when appropriate

Example:

```js
export async function updateUserReadingProgress(userId, readBooks) {
  await setDoc(
    doc(db, "usuarios", userId),
    {
      readBooks,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return { readBooks };
}
```

## Performance And Cost Control

The current project reads full collections for:

- universities
- courses
- icons
- posts
- geo data

This is acceptable while the dataset is small.
It will become expensive and slow as the app grows.

### Required Best Practices

1. Prefer one-time bootstrap loads for small reference datasets.
2. Add pagination for growing feed-style collections.
3. Use batch writes or transactions for multi-document consistency.
4. Use `serverTimestamp()` for remote write timestamps.
5. Keep counters denormalized only when they are updated in one centralized action.
6. Avoid duplicate listeners or duplicate one-time loads in multiple screens.
7. Avoid downloading documents only to filter most of them on device when a targeted query is possible.
8. Add indexes intentionally when query patterns stabilize.
9. Cache static or low-change reference data in local storage when reasonable.
10. Keep user document writes coarse enough to avoid noise, but not so coarse that unrelated fields overwrite each other.

## Current High-Risk Patterns To Remove

These should be refactored before adding many new Firebase-backed features:

1. Direct Firestore writes in screens and modals.
2. Firestore writes from `App.js`.
3. Mixed persistence paths:
   - `persistToUser`
   - `saveLocalUserData`
   - direct `setDoc`
4. UI-triggered optimistic updates with rollback logic embedded in screen files.
5. Repeated `"usuarios"` and `"posts"` document paths across the app.

## Approved Firebase Flow

Use this exact mental model:

```text
UI asks for an action
  -> service validates and coordinates
  -> repository talks to Firebase
  -> store updates state
  -> UI rerenders
```

If a new feature breaks this flow, stop and reorganize it before merging.
