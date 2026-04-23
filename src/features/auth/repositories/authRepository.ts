import { doc, getDoc, type DocumentData } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export async function fetchUserProfile(
  uid: string
): Promise<DocumentData | null> {
  const userPath = getPath(...firestorePaths.user(uid))
  const snap = await getDoc(doc(db, userPath))
  return snap.exists() ? snap.data() : null
}
