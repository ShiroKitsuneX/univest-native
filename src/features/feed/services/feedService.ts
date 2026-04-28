import {
  setPostLike,
  addReport,
  incrementPostShares,
} from '../repositories/postsRepository'
import { logger } from '@/services/logger'

export async function togglePostLike(
  postId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  try {
    await setPostLike(postId, userId, liked)
  } catch (error) {
    logger.warn('togglePostLike error:', error)
    throw error
  }
}

export async function reportPost(input: {
  postId: string
  postTitle: string
  reportedBy: string
  reason: string
}): Promise<void> {
  try {
    await addReport(input)
  } catch (error) {
    logger.warn('reportPost error:', error)
    throw error
  }
}

export async function incrementShareCount(postId: string): Promise<void> {
  try {
    await incrementPostShares(postId)
  } catch (error) {
    logger.warn('incrementShareCount error:', error)
  }
}
