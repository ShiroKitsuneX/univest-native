import {
  doc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export type UniversityUpdate = {
  description?: string
  vestibular?: string
  inscricao?: string
  prova?: string
  site?: string
  address?: string
  city?: string
  state?: string
  country?: string
  logoUrl?: string
  email?: string
  phone?: string
  color?: string
  courses?: string[]
  books?: string[]
  exams?: unknown[]
  [key: string]: unknown
}

type NamedDoc = { id: string; name?: string } & DocumentData

export async function fetchUniversitiesList(): Promise<NamedDoc[]> {
  const universitiesPath = getPath(...firestorePaths.universities())
  const snap = await getDocs(collection(db, universitiesPath))
  if (snap.empty) return []
  const f: NamedDoc[] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return [...new Map(f.map(u => [u.name, u])).values()]
}

export async function updateUniversity(
  universityId: string,
  updates: UniversityUpdate
): Promise<UniversityUpdate> {
  const universityRef = doc(
    db,
    getPath(...firestorePaths.university(universityId))
  )

  await setDoc(
    universityRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  return updates
}

export async function updateUniversityField<T>(
  universityId: string,
  field: string,
  value: T
): Promise<T> {
  const universityRef = doc(
    db,
    getPath(...firestorePaths.university(universityId))
  )

  await updateDoc(universityRef, {
    [field]: value,
    updatedAt: serverTimestamp(),
  })

  return value
}

export async function updateFollowerCount(
  universityId: string,
  delta: number
): Promise<void> {
  const universityRef = doc(
    db,
    getPath(...firestorePaths.university(universityId))
  )
  await setDoc(
    universityRef,
    { followersCount: increment(delta) },
    { merge: true }
  ).catch(() => {})
}
