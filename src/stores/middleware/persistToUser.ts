import { doc, setDoc } from 'firebase/firestore'
import type { StateCreator } from 'zustand'
import { db } from '@/core/firebase/client'
import { useAuthStore } from '@/stores/authStore'
import { loadLocalUserData, saveLocalUserData } from '@/services/storage'
import { logger } from '@/services/logger'

// Zustand middleware that mirrors a whitelist of store keys to AsyncStorage
// and to /usuarios/{uid}. Debounced to coalesce bursty updates into one write.
// Wrapped stores must gate their hydrate action with api.__suspendPersist() /
// __resumePersist() so Firestore loads don't echo straight back to Firestore.

export type PersistApi = {
  __suspendPersist: () => void
  __resumePersist: () => void
  __flushPersist: () => Promise<void>
}

type PersistOptions<T> = {
  keys: (keyof T & string)[]
  serialize?: (s: T) => Record<string, unknown>
  debounceMs?: number
}

export const persistToUser =
  <T extends object>(
    initializer: StateCreator<T, [], []>,
    { keys, serialize, debounceMs = 500 }: PersistOptions<T>
  ): StateCreator<T, [], []> =>
  (set, get, api) => {
    let suspended = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    let prev: Partial<T> | null = null

    const pick = (s: T): Partial<T> => {
      const out: Partial<T> = {}
      for (const k of keys) out[k] = s[k]
      return out
    }

    const flush = async (): Promise<void> => {
      const raw = serialize ? serialize(get()) : pick(get())
      const slice = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== undefined && v !== null)
      )
      try {
        const existing = (await loadLocalUserData()) || {}
        await saveLocalUserData({ ...existing, ...slice })
        const user = useAuthStore.getState().currentUser
        if (user && Object.keys(slice).length > 0) {
          await setDoc(
            doc(db, 'usuarios', user.uid),
            { ...slice, updatedAt: new Date().toISOString() },
            { merge: true }
          )
        }
      } catch (e: unknown) {
        logger.warn('persistToUser flush:', (e as Error)?.message)
      }
    }

    const persistApi = api as unknown as PersistApi
    persistApi.__suspendPersist = () => {
      suspended++
    }
    persistApi.__resumePersist = () => {
      suspended = Math.max(0, suspended - 1)
      if (suspended === 0) prev = pick(get())
    }
    persistApi.__flushPersist = flush

    const state = initializer(set, get, api)

    queueMicrotask(() => {
      prev = pick(get())
      api.subscribe(curr => {
        if (suspended) return
        const next = pick(curr)
        let changed = false
        for (const k of keys)
          if (next[k] !== (prev as Partial<T>)[k]) {
            changed = true
            break
          }
        if (!changed) return
        prev = next
        if (timer) clearTimeout(timer)
        timer = setTimeout(flush, debounceMs)
      })
    })

    return state
  }
