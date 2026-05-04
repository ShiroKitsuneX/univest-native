// One-shot maintenance helpers for counter and follow data.
//
// These are NOT wired into any screen — they're meant to be triggered
// manually (e.g. from a temporary debug button or a Firebase callable
// function) when you want to wipe inflated demo numbers and start the
// counters from a known-good zero state.
//
// The companion document explaining the counter strategy lives in
// `docs/COUNTERS.md`.

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'
import { logger } from '@/core/logging/logger'

export type ResetReport = {
  postsTouched: number
  likesDeleted: number
  universitiesTouched: number
  usersTouched: number
}

// Wipes likes subcollections on every post and zeroes likesCount/sharesCount
// on the post doc. Returns counts so the caller can verify scale.
export async function resetPostCounters(): Promise<{
  postsTouched: number
  likesDeleted: number
}> {
  let postsTouched = 0
  let likesDeleted = 0

  const postsCol = collection(db, getPath(...firestorePaths.posts()))
  const postsSnap = await getDocs(postsCol)

  for (const postDoc of postsSnap.docs) {
    // Delete every like in the subcollection so the size matches the new
    // counter. Firestore has no recursive delete in the client SDK, so we
    // page through and delete in a batch.
    const likesPath = firestorePaths.postLikes(postDoc.id)
    const likesSnap = await getDocs(
      collection(db, getPath(...likesPath))
    )
    if (likesSnap.size > 0) {
      const batch = writeBatch(db)
      likesSnap.docs.forEach(d => batch.delete(d.ref))
      await batch.commit()
      likesDeleted += likesSnap.size
    }

    await updateDoc(postDoc.ref, {
      likesCount: 0,
      sharesCount: 0,
    })
    postsTouched += 1
  }

  return { postsTouched, likesDeleted }
}

// Zeroes followersCount on every university doc.
export async function resetUniversityFollowerCounts(): Promise<number> {
  const unisCol = collection(db, getPath(...firestorePaths.universities()))
  const snap = await getDocs(unisCol)
  let touched = 0
  for (const u of snap.docs) {
    await updateDoc(u.ref, { followersCount: 0 })
    touched += 1
  }
  return touched
}

// Empties `followedUnis` on every user doc so nobody follows anyone.
// Run this AFTER resetUniversityFollowerCounts so the two sides stay
// consistent.
export async function unfollowEveryone(): Promise<number> {
  const usersCol = collection(db, getPath(...firestorePaths.users()))
  const snap = await getDocs(usersCol)
  let touched = 0
  for (const u of snap.docs) {
    await updateDoc(u.ref, { followedUnis: [] })
    touched += 1
  }
  return touched
}

// Convenience: full reset in the right order. Call this once when you
// want a clean slate before opening the app to real users.
//
// Usage from a temporary debug button (do NOT ship a button calling this
// to production):
//
//   import { resetAllSocialCounters } from '@/core/maintenance/resetCounters'
//   <Button onPress={() => resetAllSocialCounters().then(console.log)}>
//     Reset social counters
//   </Button>
export async function resetAllSocialCounters(): Promise<ResetReport> {
  logger.warn('[maintenance] resetAllSocialCounters: starting')

  const posts = await resetPostCounters()
  const universitiesTouched = await resetUniversityFollowerCounts()
  const usersTouched = await unfollowEveryone()

  const report: ResetReport = {
    postsTouched: posts.postsTouched,
    likesDeleted: posts.likesDeleted,
    universitiesTouched,
    usersTouched,
  }
  logger.warn('[maintenance] resetAllSocialCounters: done', report)
  return report
}

// Read-only sanity-check: returns the *real* like count for a post by
// counting the subcollection size. Useful when you want to detect
// counters that drifted away from the source of truth.
export async function realLikeCount(postId: string): Promise<number> {
  const likesSnap = await getDocs(
    collection(db, getPath(...firestorePaths.postLikes(postId)))
  )
  return likesSnap.size
}

// Re-syncs `likesCount` on every post doc so it matches the actual size
// of the likes subcollection. Run this if you suspect counters drifted
// (e.g. after a buggy session that double-incremented).
export async function reconcileLikeCounters(): Promise<number> {
  const postsCol = collection(db, getPath(...firestorePaths.posts()))
  const postsSnap = await getDocs(postsCol)
  let touched = 0
  for (const postDoc of postsSnap.docs) {
    const real = await realLikeCount(postDoc.id)
    await updateDoc(postDoc.ref, { likesCount: real })
    touched += 1
  }
  return touched
}

// Re-syncs `followersCount` on every university doc by counting how many
// `usuarios` documents include the uni name in their `followedUnis` array.
// Names (not ids) are used because `followedUnis` historically stored
// names — change this when the schema migrates.
export async function reconcileFollowerCounters(): Promise<number> {
  const usersCol = collection(db, getPath(...firestorePaths.users()))
  const usersSnap = await getDocs(usersCol)

  const followCount = new Map<string, number>()
  usersSnap.docs.forEach(u => {
    const data = u.data() as { followedUnis?: unknown }
    const list = Array.isArray(data.followedUnis) ? data.followedUnis : []
    list.forEach(name => {
      const key = String(name)
      followCount.set(key, (followCount.get(key) ?? 0) + 1)
    })
  })

  const unisCol = collection(db, getPath(...firestorePaths.universities()))
  const unisSnap = await getDocs(unisCol)
  let touched = 0
  for (const u of unisSnap.docs) {
    const data = u.data() as { name?: string; shortName?: string }
    const key = String(data.name ?? data.shortName ?? '')
    const real = followCount.get(key) ?? 0
    await updateDoc(u.ref, { followersCount: real })
    touched += 1
  }
  return touched
}

// Hard delete a single post — useful when removing demo entries that
// weren't created through the institution flow.
export async function hardDeletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, getPath(...firestorePaths.post(postId))))
}
