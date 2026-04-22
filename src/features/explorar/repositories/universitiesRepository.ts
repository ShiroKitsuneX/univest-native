import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
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
