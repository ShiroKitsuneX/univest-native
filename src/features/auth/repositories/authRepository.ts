import { doc, getDoc, setDoc, type DocumentData } from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export async function fetchUserProfile(
  uid: string
): Promise<DocumentData | null> {
  const userPath = getPath(...firestorePaths.user(uid))
  const snap = await getDoc(doc(db, userPath))
  return snap.exists() ? snap.data() : null
}

export type InitialUserProfile = {
  email: string | null
  nome: string
  sobrenome: string
  dataNascimento: string
}

export async function createInitialUserProfile(
  uid: string,
  profile: InitialUserProfile
): Promise<void> {
  const userPath = getPath(...firestorePaths.user(uid))
  await setDoc(doc(db, userPath), {
    ...profile,
    tipo: 'usuario',
    done: false,
    followedUnis: [],
    updatedAt: new Date().toISOString(),
  })
}
