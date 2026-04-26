import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export type TermsDocument = {
  id: string
  version: number
  title: string
  content: string
  createdAt: string
  active: boolean
}

export async function fetchActiveTerms(): Promise<TermsDocument | null> {
  try {
    const termsPath = getPath(...firestorePaths.terms())
    const q = query(
      collection(db, termsPath),
      where('active', '==', true),
      orderBy('version', 'desc'),
      limit(1)
    )
    const snap = await getDocs(q)
    if (!snap.empty) {
      const doc = snap.docs[0]
      return { id: doc.id, ...doc.data() } as TermsDocument
    }
    return null
  } catch {
    return null
  }
}

export type TermsAcceptance = {
  termsId: string
  termsVersion: number
  acceptedAt: string
}

export async function getUserTermsAcceptance(
  uid: string
): Promise<TermsAcceptance | null> {
  const path = getPath(...firestorePaths.userTermsAcceptance(uid))
  const snap = await getDoc(doc(db, path))
  return snap.exists() ? (snap.data() as TermsAcceptance) : null
}

export async function acceptTerms(
  uid: string,
  termsId: string,
  termsVersion: number
): Promise<void> {
  const path = getPath(...firestorePaths.userTermsAcceptance(uid))
  await setDoc(doc(db, path), {
    termsId,
    termsVersion,
    acceptedAt: new Date().toISOString(),
  })
}

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
