import {
  fetchActiveTerms,
  getUserTermsAcceptance,
  acceptTerms,
  type TermsDocument,
  type TermsAcceptance,
} from '@/features/auth/repositories/authRepository'
import { DEFAULT_TERMS_CONTENT } from '@/data/TERMS_AND_CONDITIONS'
import { logger } from '@/services/logger'

export { DEFAULT_TERMS_CONTENT }

export type TermsStatus = {
  terms: TermsDocument | null
  userAcceptance: TermsAcceptance | null
  needsReaccept: boolean
}

export async function checkTermsStatus(
  uid: string | null
): Promise<TermsStatus> {
  const terms = await fetchActiveTerms()
  if (!terms) {
    return { terms: null, userAcceptance: null, needsReaccept: false }
  }
  if (!uid) {
    return { terms, userAcceptance: null, needsReaccept: false }
  }
  const userAcceptance = await getUserTermsAcceptance(uid)
  const needsReaccept =
    !userAcceptance || userAcceptance.termsVersion < terms.version
  return { terms, userAcceptance, needsReaccept }
}

export async function acceptCurrentTerms(uid: string): Promise<boolean> {
  try {
    const terms = await fetchActiveTerms()
    if (!terms) {
      logger.warn('No active terms found')
      return false
    }
    await acceptTerms(uid, terms.id, terms.version)
    return true
  } catch (e) {
    logger.error('Failed to accept terms:', e)
    return false
  }
}
