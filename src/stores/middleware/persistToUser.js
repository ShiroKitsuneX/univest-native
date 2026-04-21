import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/authStore'
import { loadLocalUserData, saveLocalUserData } from '@/services/storage'

import { logger } from '@/services/logger'
// Zustand middleware that mirrors a whitelist of store keys to AsyncStorage
// and to /usuarios/{uid}. Debounced to coalesce bursty updates into one write.
// Wrapped stores must gate their hydrate action with api.__suspendPersist() /
// __resumePersist() so Firestore loads don't echo straight back to Firestore.
export const persistToUser =
  (initializer, { keys, serialize, debounceMs = 500 }) =>
  (set, get, api) => {
    let suspended = 0
    let timer = null
    let prev = null

    const pick = s => {
      const out = {}
      for (const k of keys) out[k] = s[k]
      return out
    }

    const flush = async () => {
      const slice = serialize ? serialize(get()) : pick(get())
      try {
        const existing = (await loadLocalUserData()) || {}
        await saveLocalUserData({ ...existing, ...slice })
        const user = useAuthStore.getState().currentUser
        if (user) {
          await setDoc(
            doc(db, 'usuarios', user.uid),
            { ...slice, updatedAt: new Date().toISOString() },
            { merge: true }
          )
        }
      } catch (e) {
        logger.warn('persistToUser flush:', e.message)
      }
    }

    api.__suspendPersist = () => {
      suspended++
    }
    api.__resumePersist = () => {
      suspended = Math.max(0, suspended - 1)
      if (suspended === 0) prev = pick(get())
    }
    api.__flushPersist = flush

    const state = initializer(set, get, api)

    queueMicrotask(() => {
      prev = pick(get())
      api.subscribe(curr => {
        if (suspended) return
        const next = pick(curr)
        let changed = false
        for (const k of keys)
          if (next[k] !== prev[k]) {
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
