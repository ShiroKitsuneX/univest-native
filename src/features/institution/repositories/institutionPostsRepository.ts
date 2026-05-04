import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { auth, db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

// Post tag families recognised by the feed UI. Keeps the tag taxonomy
// shared between author (this repo) and reader (FeedScreen) without a
// stringly-typed surface area.
export const INSTITUTION_POST_TAGS = [
  { id: 'news', label: 'Notícia', icon: '📰' },
  { id: 'lista', label: 'Lista de Obras', icon: '📚' },
  { id: 'alert', label: 'Inscrições', icon: '📋' },
  { id: 'nota', label: 'Notas de Corte', icon: '📊' },
  { id: 'simulado', label: 'Simulado', icon: '✍️' },
] as const

export type InstitutionPostTag = (typeof INSTITUTION_POST_TAGS)[number]['id']

export type CreateInstitutionPostInput = {
  uniId: string
  uniName: string
  authorId: string
  type: InstitutionPostTag
  tag: string
  icon: string
  title: string
  body: string
}

export type InstitutionPost = {
  id: string
  uniId: string
  uni: string
  type: InstitutionPostTag
  tag: string
  icon: string
  title: string
  body: string
  authorId: string
  createdAt: Date | null
  likesCount: number
  sharesCount: number
}

function normalise(id: string, raw: Record<string, unknown>): InstitutionPost {
  const ts = raw.createdAt
  const createdAt =
    ts && typeof (ts as Timestamp).toDate === 'function'
      ? (ts as Timestamp).toDate()
      : ts instanceof Date
        ? ts
        : null
  return {
    id,
    uniId: String(raw.uniId ?? ''),
    uni: String(raw.uni ?? ''),
    type: (raw.type as InstitutionPostTag) ?? 'news',
    tag: String(raw.tag ?? ''),
    icon: String(raw.icon ?? '📰'),
    title: String(raw.title ?? ''),
    body: String(raw.body ?? ''),
    authorId: String(raw.authorId ?? ''),
    createdAt,
    likesCount: Number(raw.likesCount ?? 0),
    sharesCount: Number(raw.sharesCount ?? 0),
  }
}

// Creates a new feed post owned by an institution. Returns the new post id.
// Caller is responsible for verifying the institution permission (linkedUniId
// matches `input.uniId`) — repository trusts validated input.
export async function createInstitutionPost(
  input: CreateInstitutionPostInput
): Promise<string> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('User not authenticated')
  await currentUser.getIdToken(true)

  const postsCol = collection(db, getPath(...firestorePaths.posts()))
  const ref = doc(postsCol)
  await setDoc(ref, {
    uniId: input.uniId,
    uni: input.uniName,
    type: input.type,
    tag: input.tag,
    icon: input.icon,
    title: input.title,
    body: input.body,
    authorId: input.authorId,
    createdAt: serverTimestamp(),
    likesCount: 0,
    sharesCount: 0,
  })
  return ref.id
}

export async function listPostsByInstitution(
  uniId: string
): Promise<InstitutionPost[]> {
  const postsCol = collection(db, getPath(...firestorePaths.posts()))
  const q = query(
    postsCol,
    where('uniId', '==', uniId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => normalise(d.id, d.data() as Record<string, unknown>))
}

// Deletes a post. Caller must ensure the requester owns it (`authorId` or
// matching `linkedUniId`); the security check happens in the service.
export async function deleteInstitutionPost(postId: string): Promise<void> {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('User not authenticated')
  await currentUser.getIdToken(true)

  const postPath = firestorePaths.post(postId)
  const ref = doc(db, getPath(...postPath))
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  await deleteDoc(ref)
}
