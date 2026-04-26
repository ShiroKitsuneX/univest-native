import { create } from 'zustand'
import type { User } from 'firebase/auth'
import { onAuthChange } from '@/services/auth'
import { fetchUserProfile } from '@/features/auth/repositories/authRepository'
import { checkTermsStatus } from '@/features/auth/services/termsService'
import { saveLocalUserData } from '@/services/storage'
import { logger } from '@/services/logger'

export type UserData = {
  followedUnis?: string[]
  tipo?: 'usuario' | 'instituicao'
  linkedUniId?: string
  termsAccepted?: boolean
  [key: string]: unknown
}

type AuthState = {
  currentUser: User | null
  userData: UserData | null
  authLoading: boolean
  bootstrapped: boolean
  needsTermsReaccept: boolean

  setCurrentUser: (currentUser: User | null) => void
  setUserData: (
    userData: UserData | null | ((prev: UserData | null) => UserData | null)
  ) => void
  setAuthLoading: (authLoading: boolean) => void
  setBootstrapped: (bootstrapped: boolean) => void
  setNeedsTermsReaccept: (needs: boolean) => void
  isInstitution: () => boolean
  getLinkedUniId: () => string | undefined

  subscribe: (
    onUserDoc?: (data: UserData | null, existed: boolean) => void
  ) => () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  userData: null,
  authLoading: true,
  bootstrapped: false,
  needsTermsReaccept: false,

  setCurrentUser: currentUser => set({ currentUser }),
  setUserData: userData =>
    set(
      typeof userData === 'function'
        ? state => ({ userData: userData(state.userData) })
        : { userData }
    ),
  setAuthLoading: authLoading => set({ authLoading }),
  setBootstrapped: bootstrapped => set({ bootstrapped }),
  setNeedsTermsReaccept: needsTermsReaccept => set({ needsTermsReaccept }),

  isInstitution: () => {
    const { userData } = get()
    return userData?.tipo === 'instituicao'
  },

  getLinkedUniId: () => {
    const { userData } = get()
    return userData?.linkedUniId
  },

  subscribe: onUserDoc =>
    onAuthChange(async (user: User | null) => {
      if (!user) {
        set({ currentUser: null, userData: null, authLoading: false })
        return
      }
      set({ currentUser: user })
      try {
        const fbData = (await fetchUserProfile(user.uid)) as UserData | null
        if (fbData) {
          await saveLocalUserData(fbData)
          set({ userData: fbData })
          const termsStatus = await checkTermsStatus(user.uid)
          if (termsStatus.needsReaccept) {
            set({ needsTermsReaccept: true })
          }
          onUserDoc?.(fbData, true)
        } else {
          set({ userData: { followedUnis: [] } })
          onUserDoc?.(null, false)
        }
      } catch (e: unknown) {
        logger.warn('Error loading user data:', (e as Error)?.message)
      } finally {
        set({ authLoading: false })
      }
    }),
}))
