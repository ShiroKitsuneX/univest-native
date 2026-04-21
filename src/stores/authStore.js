import { create } from 'zustand'
import { onAuthChange } from '@/services/auth'
import { fetchUserDoc } from '@/services/firestore'
import { saveLocalUserData } from '@/services/storage'
import { logger } from '@/services/logger'

export const useAuthStore = create(set => ({
  currentUser: null,
  userData: null,
  authLoading: true,
  bootstrapped: false,

  setCurrentUser: currentUser => set({ currentUser }),
  setUserData: userData =>
    set(
      typeof userData === 'function'
        ? state => ({ userData: userData(state.userData) })
        : { userData }
    ),
  setAuthLoading: authLoading => set({ authLoading }),
  setBootstrapped: bootstrapped => set({ bootstrapped }),

  subscribe: onUserDoc =>
    onAuthChange(async user => {
      if (!user) {
        set({ currentUser: null, userData: null, authLoading: false })
        return
      }
      set({ currentUser: user })
      try {
        const fbData = await fetchUserDoc(user.uid)
        if (fbData) {
          await saveLocalUserData(fbData)
          set({ userData: fbData })
          onUserDoc?.(fbData, true)
        } else {
          set({ userData: { followedUnis: [] } })
          onUserDoc?.(null, false)
        }
      } catch (e) {
        logger.warn('Error loading user data:', e.message)
      } finally {
        set({ authLoading: false })
      }
    }),
}))
