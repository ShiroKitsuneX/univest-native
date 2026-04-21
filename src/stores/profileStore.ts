import { create } from 'zustand'
import { persistToUser } from '@/stores/middleware/persistToUser'

export type Grade = {
  id: number
  ex: string
  dt: string
  type: 'prova' | 'simulado'
  s: { l: number; h: number; n: number; m: number; r: number }
}

type NewGradeDraft = {
  ex: string
  dt: string
  l: string
  h: string
  n: string
  m: string
  r: string
  type: 'prova' | 'simulado'
}

export type Theme = 'light' | 'dark' | 'auto'

type ProfileState = {
  nome: string
  sobrenome: string
  theme: Theme
  av: string
  avBgIdx: number
  gs: Grade[]
  ng: NewGradeDraft

  countryId: string
  stateId: string
  cityId: string
  studyCountryId: string
  studyStateId: string
  studyCityId: string

  setNome: (nome: string) => void
  setSobrenome: (sobrenome: string) => void
  setTheme: (theme: Theme) => void
  setAv: (av: string) => void
  setAvBgIdx: (avBgIdx: number) => void
  setGs: (gs: Grade[] | ((prev: Grade[]) => Grade[])) => void
  setNg: (
    ng: NewGradeDraft | ((prev: NewGradeDraft) => NewGradeDraft)
  ) => void
  setCountryId: (countryId: string) => void
  setStateId: (stateId: string) => void
  setCityId: (cityId: string) => void
  setStudyCountryId: (studyCountryId: string) => void
  setStudyStateId: (studyStateId: string) => void
  setStudyCityId: (studyCityId: string) => void

  hydrate: (d: Partial<Record<string, unknown>>) => void
}

const INITIAL_GRADES: Grade[] = [
  {
    id: 1,
    ex: 'FUVEST Simulado 1',
    dt: 'Mar/2025',
    type: 'simulado',
    s: { l: 62, h: 70, n: 58, m: 55, r: 680 },
  },
  {
    id: 2,
    ex: 'FUVEST Simulado 2',
    dt: 'Abr/2025',
    type: 'simulado',
    s: { l: 68, h: 74, n: 65, m: 60, r: 720 },
  },
  {
    id: 3,
    ex: 'ENEM Prova',
    dt: 'Mai/2025',
    type: 'prova',
    s: { l: 72, h: 78, n: 69, m: 64, r: 760 },
  },
]

const INITIAL_NG: NewGradeDraft = {
  ex: '',
  dt: '',
  l: '',
  h: '',
  n: '',
  m: '',
  r: '',
  type: 'prova',
}

const PERSIST_KEYS = [
  'theme',
  'av',
  'avBgIdx',
  'nome',
  'sobrenome',
  'gs',
  'countryId',
  'stateId',
  'cityId',
  'studyCountryId',
  'studyStateId',
  'studyCityId',
] as const

// Store uses `gs`; Firestore uses `grades`. Middleware writes the Firestore shape.
const serializeProfile = (s: ProfileState) => ({
  theme: s.theme,
  av: s.av,
  avBgIdx: s.avBgIdx,
  nome: s.nome,
  sobrenome: s.sobrenome,
  grades: s.gs,
  countryId: s.countryId,
  stateId: s.stateId,
  cityId: s.cityId,
  studyCountryId: s.studyCountryId,
  studyStateId: s.studyStateId,
  studyCityId: s.studyCityId,
})

export const useProfileStore = create<ProfileState>(
  persistToUser<ProfileState>(
    (set, _get, api) => ({
      nome: '',
      sobrenome: '',
      theme: 'dark',
      av: '🧑‍🎓',
      avBgIdx: 0,
      gs: INITIAL_GRADES,
      ng: INITIAL_NG,

      countryId: '',
      stateId: '',
      cityId: '',
      studyCountryId: '',
      studyStateId: '',
      studyCityId: '',

      setNome: nome => set({ nome }),
      setSobrenome: sobrenome => set({ sobrenome }),
      setTheme: theme => set({ theme }),
      setAv: av => set({ av }),
      setAvBgIdx: avBgIdx => set({ avBgIdx }),
      setGs: gs =>
        set(
          typeof gs === 'function' ? state => ({ gs: gs(state.gs) }) : { gs }
        ),
      setNg: ng =>
        set(
          typeof ng === 'function' ? state => ({ ng: ng(state.ng) }) : { ng }
        ),

      setCountryId: countryId => set({ countryId }),
      setStateId: stateId => set({ stateId }),
      setCityId: cityId => set({ cityId }),
      setStudyCountryId: studyCountryId => set({ studyCountryId }),
      setStudyStateId: studyStateId => set({ studyStateId }),
      setStudyCityId: studyCityId => set({ studyCityId }),

      hydrate: d => {
        ;(api as any).__suspendPersist()
        try {
          set(state => {
            const next: Partial<ProfileState> = {}
            if (d.theme) next.theme = d.theme as Theme
            if (d.av) next.av = d.av as string
            if (d.avBgIdx !== undefined) next.avBgIdx = d.avBgIdx as number
            if (d.grades) next.gs = d.grades as Grade[]
            if (d.nome) next.nome = d.nome as string
            if (d.sobrenome) next.sobrenome = d.sobrenome as string
            if (d.countryId) next.countryId = d.countryId as string
            if (d.stateId) next.stateId = d.stateId as string
            if (d.cityId) next.cityId = d.cityId as string
            if (d.studyCountryId)
              next.studyCountryId = d.studyCountryId as string
            if (d.studyStateId) next.studyStateId = d.studyStateId as string
            if (d.studyCityId) next.studyCityId = d.studyCityId as string
            return { ...state, ...next }
          })
        } finally {
          ;(api as any).__resumePersist()
        }
      },
    }),
    { keys: [...PERSIST_KEYS], serialize: serializeProfile }
  )
)
