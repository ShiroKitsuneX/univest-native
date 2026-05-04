import {
  saveOnboardingCompletion,
  type OnboardingData,
} from '../repositories/onboardingRepository'
import { createNotification } from '@/features/feed/repositories/notificationsRepository'
import { logger } from '@/core/logging/logger'

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

  // Fire a welcome notification so the inbox isn't empty on first open. The
  // dedupe key (`welcome-{uid}`) ensures repeat onboarding flows don't seed
  // a second welcome message. Failure is non-blocking — onboarding should
  // never fail because the welcome notification couldn't be written.
  try {
    await createNotification({
      userId: uid,
      type: 'welcome',
      title: 'Bem-vindo(a) ao UniVest! 🎓',
      body: c1
        ? `Você está acompanhando ${c1}. Veja notas de corte, datas de prova e dicas no seu feed.`
        : 'Explore universidades, acompanhe notas de corte e organize sua jornada acadêmica.',
      dedupeKey: `welcome-${uid}`,
    })
  } catch (error) {
    logger.warn('welcome notification skipped:', error)
  }
}
