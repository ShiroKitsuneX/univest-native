import {
  updateUniversity,
  updateUniversityField,
  type UniversityUpdate,
} from '../repositories/universitiesRepository'
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
