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
