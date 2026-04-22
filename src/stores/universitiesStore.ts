import { create } from 'zustand'
import { UNIVERSITIES } from '@/data/universities'
import { fetchUniversities } from '@/services/firestore'
import { persistToUser } from '@/stores/middleware/persistToUser'

export type University = {
  id?: string | number
  name: string
  followed?: boolean
  followersCount?: number
  books?: unknown[]
  exams?: unknown[]
  [key: string]: unknown
}

type UniversitiesState = {
  unis: University[]
  fbUnis: University[]
  selUni: University | null
  goalsUnis: University[]
  uniPrefs: Record<string, unknown>
  uniSort: string

  setUnis: (unis: University[] | ((prev: University[]) => University[])) => void
  setFbUnis: (v: University[] | ((prev: University[]) => University[])) => void
  setSelUni: (
    selUni: University | null | ((prev: University | null) => University | null)
  ) => void
  setGoalsUnis: (
    v: University[] | ((prev: University[]) => University[])
  ) => void
  setUniPrefs: (
    v:
      | Record<string, unknown>
      | ((prev: Record<string, unknown>) => Record<string, unknown>)
  ) => void
  setUniSort: (uniSort: string) => void
  load: () => Promise<University[]>
  applyFollowedUnis: (followedUnis?: string[]) => void
  getFollowedUnis: () => University[]
  hydrate: (d: { goalsUnis?: University[] }) => void
}

export const useUniversitiesStore = create<UniversitiesState>(
  persistToUser<UniversitiesState>(
    (set, get, api) => ({
      unis: UNIVERSITIES as University[],
      fbUnis: [],
      selUni: null,
      goalsUnis: [],
      uniPrefs: {},
      uniSort: 'date',

      setUnis: unis =>
        set(
          typeof unis === 'function'
            ? state => ({ unis: unis(state.unis) })
            : { unis }
        ),
      setFbUnis: v =>
        set(state => ({
          fbUnis: typeof v === 'function' ? v(state.fbUnis) : v,
        })),
      setSelUni: selUni =>
        set(
          typeof selUni === 'function'
            ? state => ({ selUni: selUni(state.selUni) })
            : { selUni }
        ),
      setGoalsUnis: v =>
        set(state => ({
          goalsUnis: typeof v === 'function' ? v(state.goalsUnis) : v,
        })),
      setUniPrefs: v =>
        set(state => ({
          uniPrefs: typeof v === 'function' ? v(state.uniPrefs) : v,
        })),
      setUniSort: uniSort => set({ uniSort }),

      load: async () => {
        try {
          const unisList = (await fetchUniversities()) as University[]
          if (unisList.length) {
            const merged = unisList.map(fbU => {
              const localU = (UNIVERSITIES as University[]).find(
                lU => lU.name === fbU.name
              )
              return localU
                ? {
                    ...fbU,
                    books: localU.books || [],
                    exams: localU.exams || [],
                  }
                : fbU
            })
            set({ fbUnis: merged, unis: merged })
            return merged
          }
          return []
        } catch {
          return []
        }
      },

      applyFollowedUnis: (followedUnis = []) => {
        const { fbUnis } = get()
        const source = fbUnis.length ? fbUnis : (UNIVERSITIES as University[])
        set({
          unis: source.map(u => ({
            ...u,
            followed: followedUnis.includes(u.name) || false,
          })),
        })
      },

      getFollowedUnis: () => {
        const { unis } = get()
        return unis.filter(u => u.followed)
      },

      hydrate: d => {
        ;(api as any).__suspendPersist()
        try {
          if (d.goalsUnis) set({ goalsUnis: d.goalsUnis })
        } finally {
          ;(api as any).__resumePersist()
        }
      },
    }),
    { keys: ['goalsUnis'] }
  )
)
