import {
  saveOnboardingCompletion,
  type OnboardingData,
} from '../repositories/onboardingRepository'
import { logger } from '@/services/logger'

export type { OnboardingData }

export async function completeOnboarding(
  uid: string,
  uTypeId: string | undefined,
  c1: string,
  c2: string,
  followedUniNames: string[]
): Promise<void> {
  const data: OnboardingData = {
    done: true,
    uTypeId,
    c1,
    c2,
    followedUnis: followedUniNames,
    updatedAt: new Date().toISOString(),
  }

  try {
    await saveOnboardingCompletion(uid, data)
  } catch (error) {
    logger.warn('completeOnboarding error:', error)
    throw error
  }
}
