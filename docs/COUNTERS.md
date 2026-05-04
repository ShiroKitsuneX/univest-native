# Counters & Social Numbers

This document defines how likes, follows, and shares are counted and kept honest.

> **Why a separate doc?** `ARCHITECTURE.md` covers code organisation; `FIREBASE_GUIDE.md` covers backend access rules. Counter strategy is runtime / data-model invariants — closer in spirit to the Firebase guide. Keeping it here means "where do I find the counter rules?" has one obvious answer instead of being buried in a 600-line architecture file. Same reason `FIREBASE_GUIDE.md` is its own doc.

## Source of truth

For every counter we keep in this app there is **one collection that holds the real data** and the counter is just a denormalised cache for fast reads.

| Counter on a doc                  | Source of truth                                          |
| --------------------------------- | -------------------------------------------------------- |
| `posts/{postId}.likesCount`       | size of `posts/{postId}/likes` subcollection             |
| `posts/{postId}.sharesCount`      | (no subcollection — counter is the only source)          |
| `universidades/{uniId}.followersCount` | number of `usuarios/*` whose `followedUnis` includes the uni |
| user `followedUnis` (array)       | itself                                                   |

If a counter ever disagrees with its source of truth, **the source of truth wins**. We re-sync the counter, never the other way around.

## Why we keep counters at all

Reading the source of truth on every render means N+1 reads (especially for the feed). Counters are the cache that lets the feed render the "❤️ 12" badge without paginating through every like document. The trade-off is that counters can drift, which is what the reconcile helpers below are for.

## Mutation rules

### Likes
- Toggle write order: write/delete the `likes/{userId}` doc first, then `increment(±1)` on `likesCount`. The Firestore rule allows the like-doc write and the counter-only update separately.
- The repository layer (`features/feed/repositories/postsRepository.setPostLike`) is the only allowed writer of like state. UI never bumps `likesCount` directly.

### Follows
- The user side is the source of truth. `auth.setUserFollowedUni` adds/removes the uni name from `usuarios/{uid}.followedUnis`.
- The denormalised `universidades/{uniId}.followersCount` is bumped via `universitiesRepository.updateFollowerCount(±1)` inside the same service that toggled the user-side write (`features/explorar/services/universityService.followUniversity`).
- If the counter bump fails (e.g. permission, network) the user-side write still succeeds — the next reconcile pass will fix the counter.

### Shares
- Optimistic local bump in `postsStore.setShareDelta` happens in the same callback that opens the share sheet — see [App.tsx](../App.tsx). Remote bump (`feedService.incrementShareCount → postsRepository.incrementPostShares`) only fires when the user actually picks a share target inside the sheet.
- There is no per-share document. If we need to audit shares later, add a `posts/{id}/shares` subcollection and treat it as the new source of truth.

## Reset & reconcile

Helpers live in [src/core/maintenance/resetCounters.ts](../src/core/maintenance/resetCounters.ts). They are not wired to any screen — call them from a one-shot debug button or a Firebase callable function when you want to act.

| Helper                          | What it does                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `resetPostCounters()`           | Wipes `posts/*/likes/*` subcollections and zeroes `likesCount` + `sharesCount` on every post. |
| `resetUniversityFollowerCounts()` | Sets `followersCount` to 0 on every university.                            |
| `unfollowEveryone()`            | Empties `followedUnis` on every user.                                        |
| `resetAllSocialCounters()`      | Calls the three above in order. Returns a `ResetReport` with counts touched. |
| `realLikeCount(postId)`         | Reads the actual subcollection size (read-only).                             |
| `reconcileLikeCounters()`       | Re-writes every post's `likesCount` to match its real subcollection size.    |
| `reconcileFollowerCounters()`   | Re-writes every university's `followersCount` from the `followedUnis` arrays. |
| `hardDeletePost(postId)`        | Deletes a stray demo post that wasn't created through the institution flow.  |

### Recommended one-shot bring-up

```ts
import { resetAllSocialCounters } from '@/core/maintenance/resetCounters'

// Call this once before opening the app to real users:
const report = await resetAllSocialCounters()
console.log(report)
// {
//   postsTouched: 17,
//   likesDeleted: 42,
//   universitiesTouched: 21,
//   usersTouched: 9
// }
```

After this returns, every counter is at zero, no user follows anyone, and the like subcollections are empty. From that point on the regular like/follow/share flows take over and the numbers grow honestly.

### Periodic reconcile

Counters can still drift if a write fails halfway through. The reconcile helpers can be called on a cron (Firebase scheduled function) or manually after an incident:

```ts
await reconcileLikeCounters()       // posts
await reconcileFollowerCounters()   // universities
```

These are idempotent — running them twice in a row produces the same result.

## What the client never does

- Never write `followersCount` directly from a screen. Always go through `universityService.followUniversity`.
- Never write `likesCount` directly from a screen. Always go through `feedService.togglePostLike → postsRepository.setPostLike`.
- Never copy a counter into another doc. Read the counter from its owning doc.

## Future direction

When the user volume justifies it, move counter increments into Cloud Functions / Firestore triggers so the client only writes the source of truth and the counter is updated server-side. That removes the rare drift problem entirely. Until then, the reconcile helpers are the safety net.
