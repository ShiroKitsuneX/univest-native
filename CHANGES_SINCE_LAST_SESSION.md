# Changes Made Since Last Claude Session

## Summary

This document covers all completed implementation work including:

1. Firebase-backed Stories feature
2. Institution account support (institution mode)
3. Various bug fixes

---

## Part 1: Stories Feature Implementation

### Context

- Stories were previously hardcoded in `src/data/stories.js`
- Needed Firebase-backed stories for institutions to post real content

### Files Created

#### src/core/firebase/firestorePaths.ts

- Centralized Firestore path definitions
- Added story paths: `universidades/{uniId}/stories/{storyId}`
- Added university path: `universidades/{universityId}`

#### src/features/feed/repositories/storiesRepository.ts

```typescript
;-fetchActiveStories(followedUniIds) - // Get stories from followed universities
  createStory(input) - // Institution creates story
  markStoryViewed(uniId, storyId) // Track view count
```

#### src/features/feed/repositories/postsRepository.ts

```typescript
;-setPostLike(postId, userId, liked) - // Handle post likes
  addReport(input) - // Report posts
  incrementPostShares(postId) // Track share counts
```

#### src/features/feed/services/storiesService.ts

```typescript
;-loadStoriesForUser(followedUniIds) -
  addStory(input) -
  trackStoryView(uniId, storyId)
```

#### src/features/feed/services/feedService.ts

```typescript
;-togglePostLike(postId, userId, liked) -
  reportPost(input) -
  incrementShareCount(postId)
```

### Files Modified

#### src/stores/storiesStore.ts

- Replaced hardcoded data import with repository calls
- `load()` now fetches from Firebase
- `markViewed()` calls remote tracking

#### src/screens/feed/FeedScreen.tsx

- Removed direct Firebase imports
- Uses `feedService` for like/share/report (follows ARCHITECTURE.md)

### Firestore Structure

```
universidades/{uniId}/stories/{storyId}
├── uniId: string
├── uniName: string
├── uniColor: string
├── imageUrl: string
├── videoUrl?: string
├── createdAt: timestamp
├── expiresAt: timestamp (createdAt + 24h)
└── viewsCount: number
```

---

## Part 2: Institution Account Implementation

### Context

- Users can be regular users (tipo: 'usuario') or institutions (tipo: 'instituicao')
- Institutions should see a different "Perfil" screen where they can edit their university info
- UNICAMP has static ID '2' in local data

### Files Created

#### src/features/explorar/repositories/universitiesRepository.ts

```typescript
;-updateUniversity(universityId, updates) - // Save all updates
  updateUniversityField(universityId, field, value) // Save single field
```

#### src/features/explorar/services/universityService.ts

```typescript
;-saveUniversityUpdates(universityId, updates) -
  updateUniversityInfo(field, value)
```

#### src/screens/perfil/InstitutionAdminScreen.tsx

- Institution's "Perfil" substitute
- Shows university info with Edit button
- TextInput fields for: description, vestibular, inscricao, prova, site
- Save button commits to Firestore via universityService
- Shows follower count

### Files Modified

#### src/stores/authStore.ts

```typescript
// Added to UserData type:
tipo?: 'usuario' | 'instituicao'
linkedUniId?: string

// Added to store:
isInstitution: () => boolean  // Returns userData?.tipo === 'instituicao'
getLinkedUniId: () => string | undefined
```

#### src/navigation/MainTabs.tsx

- Imports `useAuthStore`, `InstitutionAdminScreen`
- In `PerfilTab()`:
  - Checks `isInstitution()` and `getLinkedUniId()`
  - If both true → renders InstitutionAdminScreen
  - Otherwise → renders PerfilScreen

### How Institution Login Works

1. User logs in with Firebase Auth (email/password)
2. App loads user document from `usuarios/{uid}`
3. If `tipo === 'instituicao'` and `linkedUniId` exists:
   - MainTabs PerfilTab shows InstitutionAdminScreen
   - Otherwise shows regular PerfilScreen

---

## Part 3: Bug Fixes (Onboarding + Security)

### Problem

- Institution accounts were required to do onboarding
- Previous user session data was not cleared on logout, causing session bleeding

### Solution

#### Fix 1: Institution accounts skip onboarding

**File: src/app/useBootstrap.ts**

- Added check for `tipo === 'instituicao'`
- If institution: sets `done: true`, `step: 3`, `uType: null`
- Skips onboarding flow entirely

```typescript
const isInstitution = fbData.tipo === 'instituicao'
if (isInstitution) {
  setDone(true)
  setStep(3)
  setUType(null)
}
```

#### Fix 2: Proper logout clears session data

**File: src/services/storage.ts**

- Added `clearLocalUserData()` function to clear AsyncStorage

**File: src/services/auth.ts**

- `logout()` now:
  1. Signs out from Firebase Auth
  2. Clears local AsyncStorage

**Note:** App.tsx handles resetting onboarding/store state after logout.

```typescript
export const logout = async (): Promise<void> => {
  await signOut(auth)
  await clearLocalUserData()
}
```

**Fix 2b: Removed require cycle**

- Moved store imports out of auth.ts (was causing: persistToUser → authStore → auth → onboardingStore → persistToUser)
- App.tsx handles state reset after logout separately

**Fix 2c: Filter undefined values in persistToUser**

- persistToUser was writing undefined values to Firestore causing warnings
- Added filter to remove undefined/null before writing

```typescript
const slice = Object.fromEntries(
  Object.entries(raw).filter(([, v]) => v !== undefined && v !== null)
)
```

---

## Part 4: Previous Session Fixes (from earlier)

### src/app/useBootstrap.ts

- Added empty dependency arrays `[]` to prevent infinite re-render loops
- Lines 73-77 and 79-86

### src/theme/useTheme.ts (from earlier)

- Added `useMemo` to prevent returning new objects every render

### src/stores/universitiesStore.ts (from earlier)

- Added `getFollowedUnis()` getter function

### src/components/StoriesStrip.tsx (from earlier)

- Uses `getFollowedUnis()` instead of `.filter()` in selector

---

## Architecture Compliance

All changes follow `@docs/ARCHITECTURE.md` and `@docs/FIREBASE_GUIDE.md`:

1. **Firebase SDK only in repositories** ✓
   - Stories: `storiesRepository.ts`
   - Posts: `postsRepository.ts`
   - Universities: `universitiesRepository.ts`

2. **All paths centralized** ✓
   - `src/core/firebase/firestorePaths.ts`

3. **UI does not import Firebase** ✓
   - FeedScreen.tsx uses service layer
   - InstitutionAdminScreen.tsx uses service layer

4. **Standard flow** (per DEVELOPMENT_GUIDE.md) ✓
   - UI → Store → Service → Repository → Firebase

---

## Files Structure Summary

```
src/
├── core/firebase/
│   └── firestorePaths.ts              # NEW - centralized paths
├── features/
│   ├── explorar/
│   │   ├── repositories/
│   │   │   └── universitiesRepository.ts  # NEW
│   │   └── services/
│   │       └── universityService.ts     # NEW
│   └── feed/
│       ├── repositories/
│       │   ├── storiesRepository.ts     # NEW
│       │   └── postsRepository.ts      # NEW
│       └── services/
│           ├── storiesService.ts        # NEW
│           └── feedService.ts          # NEW
├── stores/
│   ├── authStore.ts            # MODIFIED - institution selectors
│   └── storiesStore.ts      # MODIFIED - uses repository
├── services/
│   ├── auth.ts              # MODIFIED - logout clears session
│   └── storage.ts           # MODIFIED - clearLocalUserData
├── screens/
│   ├── perfil/
│   │   └── InstitutionAdminScreen.tsx  # NEW
│   └── feed/
│       └── FeedScreen.tsx    # MODIFIED - no Firebase imports
├── navigation/
│   └── MainTabs.tsx        # MODIFIED - institution routing
└── app/
    └── useBootstrap.ts     # MODIFIED - institution skips onboarding
```

---

## What Claude Should Continue

### See INSTITUTION_IMPROVEMENTS.md for detailed plan

**Quick Summary:**

1. Fix institution account UI issues (remove user-specific features, add institution-specific features)
2. Add service/repository layer for institution profile updates
3. Fix duplicate settings icon bug
4. Add logo editing, followers count, contact info editing
5. Move from hardcoded data to Firebase for editable institution fields

---

## Testing Checklist

### Institution Login

1. Log out from any account
2. Clear app data (optional)
3. Log in with `unicamp@univest.com`
4. Should skip onboarding → go directly to InstitutionAdminScreen

### Stories

1. Add stories to Firebase: `universidades/{uniId}/stories/{storyId}`
2. Follow university from regular user account
3. Stories appear in Feed

---
