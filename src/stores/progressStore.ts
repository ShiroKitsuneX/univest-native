import { create } from 'zustand'
import { persistToUser } from '@/stores/middleware/persistToUser'

export type BookStatus = 'reading' | 'read' | 'none'

type ProgressState = {
  readBooks: Record<string, BookStatus>
  readingBooks: string[]
  completedTodos: Record<string, boolean>

  setReadBooks: (
    v:
      | Record<string, BookStatus>
      | ((prev: Record<string, BookStatus>) => Record<string, BookStatus>)
  ) => void
  setReadingBooks: (v: string[] | ((prev: string[]) => string[])) => void
  setCompletedTodos: (
    v:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void
  updateBookStatus: (bookKey: string, status: BookStatus) => void
  hydrate: (d: {
    readBooks?: Record<string, BookStatus>
    readingBooks?: string[]
    completedTodos?: Record<string, boolean>
  }) => void
}

export const useProgressStore = create<ProgressState>(
  persistToUser<ProgressState>(
    (set, _get, api) => ({
      readBooks: {},
      readingBooks: [],
      completedTodos: {},

      setReadBooks: v =>
        set(state => ({
          readBooks: typeof v === 'function' ? v(state.readBooks) : v,
        })),
      setReadingBooks: v =>
        set(state => ({
          readingBooks: typeof v === 'function' ? v(state.readingBooks) : v,
        })),
      setCompletedTodos: v =>
        set(state => ({
          completedTodos: typeof v === 'function' ? v(state.completedTodos) : v,
        })),

      updateBookStatus: (bookKey, status) =>
        set(state => {
          const next = { ...state.readBooks }
          if (status === 'reading') next[bookKey] = 'reading'
          else if (status === 'read') next[bookKey] = 'read'
          else if (status === 'none') delete next[bookKey]
          return { readBooks: next }
        }),

      hydrate: d => {
        ;(api as any).__suspendPersist()
        try {
          set(state => {
            const next: Partial<ProgressState> = {}
            if (d.readBooks) next.readBooks = d.readBooks
            if (d.readingBooks) next.readingBooks = d.readingBooks
            if (d.completedTodos) next.completedTodos = d.completedTodos
            return { ...state, ...next }
          })
        } finally {
          ;(api as any).__resumePersist()
        }
      },
    }),
    { keys: ['readBooks', 'readingBooks', 'completedTodos'] }
  )
)
