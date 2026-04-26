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
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export async function fetchPosts() {
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
) {
  if (!posts?.length || !uid) return {}

  const likeChecks = await Promise.all(
    posts.map(p => {
      const path = firestorePaths.postLike(String(p.id), uid)
      return getDoc(doc(db, getPath(...path)))
    })
  )

  const result: Record<string, boolean> = {}
  for (let i = 0; i < likeChecks.length; i += 1) {
    if (likeChecks[i].exists()) {
      result[String(posts[i].id)] = true
    }
  }
  return result
}

export async function setPostLike(
  postId: string,
  userId: string,
  liked: boolean
) {
  const likePath = firestorePaths.postLike(postId, userId)
  const postPath = firestorePaths.post(postId)

  if (liked) {
    await setDoc(doc(db, getPath(...likePath)), {
      timestamp: serverTimestamp(),
    })
    await updateDoc(doc(db, getPath(...postPath)), { likesCount: increment(1) })
  } else {
    await deleteDoc(doc(db, getPath(...likePath)))
    await updateDoc(doc(db, getPath(...postPath)), {
      likesCount: increment(-1),
    })
  }
}

export async function addReport(input: {
  postId: string
  postTitle: string
  reportedBy: string
  reason: string
}) {
  await addDoc(collection(db, getPath(...firestorePaths.reports())), {
    postId: input.postId,
    postTitle: input.postTitle,
    reportedBy: input.reportedBy,
    reason: input.reason,
    createdAt: serverTimestamp(),
  })
}

export async function incrementPostShares(postId: string) {
  const postPath = firestorePaths.post(postId)
  await updateDoc(doc(db, getPath(...postPath)), { sharesCount: increment(1) })
}
