import { create } from 'zustand'
import { USER_TYPES } from '@/data/userTypes'
import { persistToUser } from '@/stores/middleware/persistToUser'

type UserType = { id: string; [key: string]: unknown }

type OnboardingState = {
  step: number
  done: boolean
  uType: UserType | null
  c1: string
  c2: string

  setStep: (step: number | ((s: number) => number)) => void
  setDone: (done: boolean) => void
  setUType: (uType: UserType | null) => void
  setC1: (c1: string) => void
  setC2: (c2: string) => void
  hydrateFromUTypeId: (uTypeId: string | null | undefined) => void
  hydrateFromLocal: (d: {
    step?: number
    done?: boolean
    uTypeId?: string
    c1?: string
    c2?: string
  }) => void
  hydrateFromFb: (d: {
    done?: boolean
    uTypeId?: string
    c1?: string
    c2?: string
  }) => void
}

const PERSIST_KEYS = ['step', 'done', 'uType', 'c1', 'c2'] as const

const serialize = (s: OnboardingState) => ({
  step: s.step,
  done: s.done,
  uTypeId: s.uType?.id,
  c1: s.c1,
  c2: s.c2,
})

export const useOnboardingStore = create<OnboardingState>(
  persistToUser<OnboardingState>(
    (set, get, api) => ({
      step: 0,
      done: false,
      uType: null,
      c1: '',
      c2: '',

      setStep: step =>
        set(state => ({
          step: typeof step === 'function' ? step(state.step) : step,
        })),
      setDone: done => set({ done }),
      setUType: uType => set({ uType }),
      setC1: c1 => set({ c1 }),
      setC2: c2 => set({ c2 }),

      hydrateFromUTypeId: uTypeId => {
        const ut = uTypeId
          ? (USER_TYPES as UserType[]).find(t => t.id === uTypeId) || null
          : null
        set({ uType: ut })
      },

      hydrateFromLocal: d => {
        ;(api as any).__suspendPersist()
        try {
          set({
            step: d.step || 0,
            done: d.done || false,
            uType: d.uTypeId
              ? (USER_TYPES as UserType[]).find(t => t.id === d.uTypeId) || null
              : null,
            c1: d.c1 || '',
            c2: d.c2 || '',
          })
        } finally {
          ;(api as any).__resumePersist()
        }
      },

      hydrateFromFb: d => {
        ;(api as any).__suspendPersist()
        try {
          set(state => {
            if (d.done === true) {
              const ut = d.uTypeId
                ? (USER_TYPES as UserType[]).find(t => t.id === d.uTypeId)
                : null
              return {
                uType: ut || state.uType,
                c1: d.c1 || state.c1,
                c2: d.c2 || state.c2,
                step: 3,
                done: true,
              }
            }
            if (d.done === false) return { step: 1, done: false }
            return state
          })
        } finally {
          ;(api as any).__resumePersist()
        }
      },
    }),
    { keys: [...PERSIST_KEYS], serialize }
  )
)
