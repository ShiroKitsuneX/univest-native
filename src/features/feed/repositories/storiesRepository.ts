import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  where,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export type StoryDoc = {
  id: string
  uniId: string
  uniName: string
  uniColor: string
  imageUrl: string
  videoUrl?: string
  createdAt: string
  expiresAt: string
  viewsCount: number
}

export type CreateStoryInput = {
  uniId: string
  uniName: string
  uniColor: string
  imageUrl: string
  videoUrl?: string
}

export async function fetchActiveStories(
  followedUniIds: string[]
): Promise<StoryDoc[]> {
  if (!followedUniIds.length) return []

  const allStories: StoryDoc[] = []
  const now = new Date()

  await Promise.all(
    followedUniIds.map(async uniId => {
      const storiesRef = collection(
        db,
        getPath(...firestorePaths.universityStories(uniId))
      )
      const q = query(
        storiesRef,
        where('expiresAt', '>', now.toISOString()),
        orderBy('expiresAt', 'desc')
      )

      const snapshot = await getDocs(q)
      snapshot.docs.forEach(d => {
        const data = d.data()
        allStories.push({
          id: d.id,
          uniId: data.uniId,
          uniName: data.uniName,
          uniColor: data.uniColor,
          imageUrl: data.imageUrl,
          videoUrl: data.videoUrl,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString?.() ??
            new Date().toISOString(),
          expiresAt:
            data.expiresAt?.toDate?.()?.toISOString?.() ??
            new Date().toISOString(),
          viewsCount: data.viewsCount ?? 0,
        })
      })
    })
  )

  return allStories.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function createStory(input: CreateStoryInput): Promise<StoryDoc> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const storiesRef = collection(
    db,
    getPath(...firestorePaths.universityStories(input.uniId))
  )

  const docRef = await addDoc(storiesRef, {
    uniId: input.uniId,
    uniName: input.uniName,
    uniColor: input.uniColor,
    imageUrl: input.imageUrl,
    videoUrl: input.videoUrl ?? null,
    createdAt: serverTimestamp(),
    expiresAt: serverTimestamp(),
    viewsCount: 0,
  })

  return {
    id: docRef.id,
    uniId: input.uniId,
    uniName: input.uniName,
    uniColor: input.uniColor,
    imageUrl: input.imageUrl,
    videoUrl: input.videoUrl,
    createdAt: new Date().toISOString(),
    expiresAt,
    viewsCount: 0,
  }
}

export async function markStoryViewed(
  uniId: string,
  storyId: string
): Promise<void> {
  const storyRef = doc(
    db,
    getPath(...firestorePaths.universityStory(uniId, storyId))
  )

  await updateDoc(storyRef, {
    viewsCount: increment(1),
  })
}
