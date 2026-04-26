import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export async function fetchCoursesList(): Promise<string[]> {
  const coursesPath = getPath(...firestorePaths.courses())
  const snap = await getDocs(collection(db, coursesPath))
  if (snap.empty) return []
  return [
    ...new Set(snap.docs.map(d => (d.data() as { name: string }).name)),
  ].sort()
}

export async function fetchIconsMap(): Promise<Record<string, string>> {
  const iconsPath = getPath(...firestorePaths.icons())
  const snap = await getDocs(collection(db, iconsPath))
  if (snap.empty) return {}
  const m: Record<string, string> = {}
  snap.docs.forEach(d => {
    const x = d.data() as { id: string; emoji: string }
    m[x.id] = x.emoji
  })
  return m
}
