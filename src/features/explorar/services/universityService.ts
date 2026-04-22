import {
  updateUniversity,
  updateUniversityField,
  updateFollowerCount,
  type UniversityUpdate,
} from '../repositories/universitiesRepository'
import { doc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'
import { logger } from '@/services/logger'

export async function saveUniversityUpdates(
  universityId: string,
  updates: UniversityUpdate
): Promise<UniversityUpdate> {
  try {
    return await updateUniversity(universityId, updates)
  } catch (error) {
    logger.warn('saveUniversityUpdates error:', error)
    throw error
  }
}

export async function updateUniversityInfo<T>(
  universityId: string,
  field: string,
  value: T
): Promise<T> {
  try {
    return await updateUniversityField(universityId, field, value)
  } catch (error) {
    logger.warn('updateUniversityInfo error:', error)
    throw error
  }
}

export async function toggleUniversityFollow(
  userId: string,
  universityId: string,
  universityName: string,
  isFollowing: boolean
): Promise<void> {
  try {
    const userPath = getPath(...firestorePaths.user(userId))
    const userRef = doc(db, userPath)

    await setDoc(
      userRef,
      {
        followedUnis: isFollowing
          ? arrayUnion(universityName)
          : arrayRemove(universityName),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    if (universityId) {
      await updateFollowerCount(universityId, isFollowing ? 1 : -1)
    }
  } catch (error) {
    logger.warn('toggleUniversityFollow error:', error)
    throw error
  }
}
