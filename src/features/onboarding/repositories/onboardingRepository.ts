import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export type OnboardingData = {
  done: boolean
  uTypeId?: string
  c1?: string
  c2?: string
  followedUnis?: string[]
  updatedAt: string
}

export async function saveOnboardingCompletion(
  uid: string,
  data: OnboardingData
): Promise<void> {
  const userPath = getPath(...firestorePaths.user(uid))
  const userRef = doc(db, userPath)
  await setDoc(userRef, data, { merge: true })
}

// Minimal "mark onboarding done" used by the institution onboarding flow,
// which doesn't have uType/c1/c2/followedUnis to save — only the done flag
// matters for the navigation gate.
export async function setOnboardingDone(uid: string): Promise<void> {
  const userRef = doc(db, getPath(...firestorePaths.user(uid)))
  await setDoc(
    userRef,
    { done: true, updatedAt: new Date().toISOString() },
    { merge: true }
  )
}
