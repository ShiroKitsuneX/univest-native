import {
  fetchActiveStories,
  createStory,
  markStoryViewed,
  type StoryDoc,
  type CreateStoryInput,
} from '../repositories/storiesRepository'
import { logger } from '@/core/logging/logger'

export type { StoryDoc, CreateStoryInput }

export async function loadStoriesForUser(
  followedUniIds: string[]
): Promise<StoryDoc[]> {
  try {
    return await fetchActiveStories(followedUniIds)
  } catch (error) {
    logger.warn('loadStoriesForUser error:', error)
    return []
  }
}

export async function addStory(input: CreateStoryInput): Promise<StoryDoc> {
  try {
    return await createStory(input)
  } catch (error) {
    logger.warn('addStory error:', error)
    throw error
  }
}

export async function trackStoryView(
  uniId: string,
  storyId: string
): Promise<void> {
  try {
    await markStoryViewed(uniId, storyId)
  } catch (error) {
    logger.warn('trackStoryView error:', error)
  }
}
