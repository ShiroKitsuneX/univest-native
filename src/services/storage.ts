import AsyncStorage from '@react-native-async-storage/async-storage'
import { logger } from '@/services/logger'

const STORAGE_KEY = 'univest_user'

export const loadLocalUserData = async (): Promise<Record<
  string,
  unknown
> | null> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e: unknown) {
    logger.warn('loadLocalUserData:', (e as Error)?.message)
  }
  return null
}

export const saveLocalUserData = async (
  data: Record<string, unknown>
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e: unknown) {
    logger.warn('saveLocalUserData:', (e as Error)?.message)
  }
}

export const clearLocalUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (e: unknown) {
    logger.warn('clearLocalUserData:', (e as Error)?.message)
  }
}
