import {
  updateUniversity,
  updateUniversityField,
  updateFollowerCount,
  type UniversityUpdate,
} from '../repositories/universitiesRepository'
import { setUserFollowedUni } from '@/features/auth/repositories/authRepository'
import {
  useUniversitiesStore,
  type University,
} from '@/stores/universitiesStore'
import { useAuthStore, type UserData } from '@/stores/authStore'
import { notifyFollowerMilestone } from '@/features/institution/services/institutionNotificationsService'
import { logger } from '@/core/logging/logger'

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

// Raw two-document write: user.followedUnis array + university follower count.
// Prefer `followUniversity` (which orchestrates optimistic UI + rollback) for
// new code; this remains exported for callers that already drive their own UI
// state (e.g. onboarding before the user document exists in stores).
export async function toggleUniversityFollow(
  userId: string,
  universityId: string,
  universityName: string,
  isFollowing: boolean
): Promise<void> {
  try {
    await setUserFollowedUni(userId, universityName, isFollowing)
    if (universityId) {
      await updateFollowerCount(universityId, isFollowing ? 1 : -1)
    }
  } catch (error) {
    logger.warn('toggleUniversityFollow error:', error)
    throw error
  }
}

export class NotAuthenticatedError extends Error {
  code = 'NOT_AUTHENTICATED'
  constructor() {
    super('Faça login para seguir universidades')
  }
}

const applyFollowOptimistic = (uni: University, isFollowing: boolean): void => {
  const delta = isFollowing ? 1 : -1
  const { setUnis, selUni, setSelUni } = useUniversitiesStore.getState()

  setUnis(prev =>
    prev.map(u =>
      u.name === uni.name
        ? {
            ...u,
            followed: isFollowing,
            followersCount: (Number(u.followersCount) || 0) + delta,
          }
        : u
    )
  )

  if (selUni?.name === uni.name) {
    setSelUni(prev =>
      prev
        ? {
            ...prev,
            followed: isFollowing,
            followersCount: (Number(prev.followersCount) || 0) + delta,
          }
        : prev
    )
  }

  const { setUserData } = useAuthStore.getState()
  setUserData((prev: UserData | null) => {
    const cur = prev?.followedUnis || []
    const next = isFollowing
      ? [...new Set([...cur, uni.name])]
      : cur.filter(n => n !== uni.name)
    return { ...(prev || {}), followedUnis: next }
  })
}

// Optimistically update the universities + auth stores, then write to Firestore.
// On failure, roll the optimistic update back and rethrow.
// Throws `NotAuthenticatedError` if no user is signed in.
export async function followUniversity(
  uni: University,
  isFollowing: boolean
): Promise<void> {
  const { currentUser } = useAuthStore.getState()
  if (!currentUser) throw new NotAuthenticatedError()

  const previousFollowers = Number(uni.followersCount) || 0

  applyFollowOptimistic(uni, isFollowing)

  try {
    await toggleUniversityFollow(
      currentUser.uid,
      uni.id ? String(uni.id) : '',
      uni.name,
      isFollowing
    )
  } catch (error) {
    applyFollowOptimistic(uni, !isFollowing)
    logger.warn('followUniversity error:', error)
    throw error
  }

  // Best-effort milestone notification to the institution. Idempotent via
  // dedupeKey — same milestone never produces two notifications. Skip on
  // unfollow (we only celebrate growth) and when ownerUid isn't set yet
  // (legacy unis without a claimed institution account).
  if (isFollowing && uni.ownerUid && uni.id) {
    notifyFollowerMilestone({
      recipientUid: uni.ownerUid,
      uniId: String(uni.id),
      uniName: uni.name,
      previousFollowers,
      newFollowers: previousFollowers + 1,
    }).catch(() => {})
  }
}
