import {
  collection,
  doc,
  getDoc,
  getDocs,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export const fetchUserDoc = async (
  uid: string
): Promise<DocumentData | null> => {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  return snap.exists() ? snap.data() : null
}

type NamedDoc = { id: string; name?: string } & DocumentData

export const fetchUniversities = async (): Promise<NamedDoc[]> => {
  const snap = await getDocs(collection(db, 'universidades'))
  if (snap.empty) return []
  const f: NamedDoc[] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return [...new Map(f.map(u => [u.name, u])).values()]
}

export const fetchCourses = async (): Promise<string[]> => {
  const snap = await getDocs(collection(db, 'cursos'))
  if (snap.empty) return []
  return [
    ...new Set(snap.docs.map(d => (d.data() as { name: string }).name)),
  ].sort()
}

export const fetchIcons = async (): Promise<Record<string, string>> => {
  const snap = await getDocs(collection(db, 'icones'))
  if (snap.empty) return {}
  const m: Record<string, string> = {}
  snap.docs.forEach(d => {
    const x = d.data() as { id: string; emoji: string }
    m[x.id] = x.emoji
  })
  return m
}

type PostDoc = {
  id: string
  createdAt?: { toMillis?: () => number }
} & DocumentData

export const fetchPosts = async (): Promise<PostDoc[]> => {
  const snap = await getDocs(collection(db, 'posts'))
  if (snap.empty) return []
  const f: PostDoc[] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  f.sort(
    (a, b) =>
      (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
  )
  return f
}

export const fetchPostLikes = async (
  posts: { id: string | number }[],
  uid: string
): Promise<Record<string, boolean>> => {
  if (!posts?.length || !uid) return {}
  const checks = await Promise.all(
    posts.map(p => getDoc(doc(db, 'posts', String(p.id), 'likes', uid)))
  )
  const lk: Record<string, boolean> = {}
  checks.forEach((snap, i) => {
    if (snap.exists()) lk[String(posts[i].id)] = true
  })
  return lk
}
