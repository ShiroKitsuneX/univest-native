import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export async function fetchPosts(): Promise<unknown[]> {
  const postsPath = getPath(...firestorePaths.posts())
  const snap = await getDocs(collection(db, postsPath))
  if (snap.empty) return []
  const f = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  f.sort(
    (a: any, b: any) =>
      (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  )
  return f
}

export async function fetchPostLikes(
  posts: { id: string | number }[],
  uid: string
): Promise<Record<string, boolean>> {
  if (!posts?.length || !uid) return {}
  const checks = await Promise.all(
    posts.map(p => getDoc(doc(db, getPath(...firestorePaths.postLike(String(p.id), uid))))
  )
  const lk: Record<string, boolean> = {}
  checks.forEach((snap, i) => {
    if (snap.exists()) lk[String(posts[i].id)] = true
  })
  return lk
}

export async function setPostLike(
  postId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  const likeRef = doc(db, getPath(...firestorePaths.postLike(postId, userId)))
  const postRef = doc(db, getPath(...firestorePaths.post(postId)))

  if (liked) {
    await setDoc(likeRef, { timestamp: serverTimestamp() })
    await updateDoc(postRef, { likesCount: increment(1) })
  } else {
    await deleteDoc(likeRef)
    await updateDoc(postRef, { likesCount: increment(-1) })
  }
}

export async function addReport(input: {
  postId: string
  postTitle: string
  reportedBy: string
  reason: string
}): Promise<void> {
  await addDoc(collection(db, getPath(...firestorePaths.reports())), {
    postId: input.postId,
    postTitle: input.postTitle,
    reportedBy: input.reportedBy,
    reason: input.reason,
    createdAt: serverTimestamp(),
  })
}

export async function incrementPostShares(postId: string): Promise<void> {
  const postRef = doc(db, getPath(...firestorePaths.post(postId)))
  await updateDoc(postRef, { sharesCount: increment(1) })
}