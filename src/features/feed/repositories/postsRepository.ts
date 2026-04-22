import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

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
