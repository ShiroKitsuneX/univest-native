import { useEffect, useRef } from 'react'
import { loadLocalUserData, saveLocalUserData } from '@/core/storage/localUserStorage'
import { onAuthChange } from '@/services/auth'
import { fetchUserProfile } from '@/features/auth/repositories/authRepository'
import { useAuthStore } from '@/stores/authStore'
import { claimUniversityOwnership } from '@/features/explorar/repositories/universitiesRepository'
import { useProfileStore } from '@/stores/profileStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useProgressStore } from '@/stores/progressStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useGeoStore } from '@/stores/geoStore'
import { logger } from '@/core/logging/logger'

export function useBootstrap() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    loadLocalUserData().then(localData => {
      if (localData) {
        useOnboardingStore.getState().hydrateFromLocal(localData)
        useProfileStore.getState().hydrate(localData)
        useProgressStore.getState().hydrate(localData)
        usePostsStore.getState().hydrate(localData)
      }
      useAuthStore.getState().setBootstrapped(true)
    })
  }, [])

  useEffect(() => {
    const { setCurrentUser, setUserData, setAuthLoading } =
      useAuthStore.getState()
    const { setStep, setDone, setUType } = useOnboardingStore.getState()
    const unsub = onAuthChange(async user => {
      if (user) {
        setCurrentUser(user)
        try {
          const fbData = await fetchUserProfile(user.uid)
          if (fbData) {
            await saveLocalUserData(fbData)
            setUserData(fbData)
            const isInstitution = fbData.tipo === 'instituicao'
            if (isInstitution) {
              // Institutions follow the user-doc `done` flag now — fresh
              // accounts (`done !== true`) get routed to the dedicated
              // institution onboarding screen via RootNavigator. Existing
              // institutions whose doc already has done=true skip it.
              setDone(fbData.done === true)
              setStep(0)
              setUType(null)
              // Backfill ownerUid on the linked university so milestone
              // notifications can find a recipient. Idempotent — the merge
              // write only updates the field, no-op if already set.
              if (fbData.linkedUniId) {
                claimUniversityOwnership(fbData.linkedUniId, user.uid).catch(
                  e =>
                    logger.warn(
                      'claimUniversityOwnership:',
                      (e as Error)?.message
                    )
                )
              }
            } else if (fbData.done === true) {
              useOnboardingStore.getState().hydrateFromFb(fbData)
            } else {
              setStep(1)
              setDone(false)
            }
            useProfileStore.getState().hydrate(fbData)
            useProgressStore.getState().hydrate(fbData)
            usePostsStore.getState().hydrate(fbData)
            useUniversitiesStore.getState().hydrate(fbData)
          } else {
            setUserData({ followedUnis: [] })
            setStep(1)
            setDone(false)
          }
        } catch (e) {
          logger.warn('Error loading user data:', e.message)
        }
      } else {
        setCurrentUser(null)
        setUserData(null)
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    useCoursesStore.getState().load()
    useGeoStore.getState().load()
    useUniversitiesStore.getState().load()
  }, [])

  useEffect(() => {
    const userData = useAuthStore.getState().userData
    useUniversitiesStore.getState().applyFollowedUnis(userData?.followedUnis)
  }, [])

  // Posts load reacts to the auth state — on the initial mount `currentUser`
  // is null because the Firebase auth listener hasn't fired yet. Subscribing
  // ensures we (re)load posts the moment auth resolves and after every
  // user-switch, instead of bailing out forever on cold open.
  useEffect(() => {
    let lastUid: string | null = null
    const run = (uid: string | null) => {
      if (!uid || uid === lastUid) return
      lastUid = uid
      ;(async () => {
        try {
          await usePostsStore.getState().load()
          await usePostsStore.getState().loadLikesFor(uid)
        } catch (e) {
          logger.warn('post bootstrap:', (e as Error)?.message)
        }
      })()
    }
    // Fire once for the current state, then subscribe to changes.
    run(useAuthStore.getState().currentUser?.uid ?? null)
    const unsub = useAuthStore.subscribe(s => run(s.currentUser?.uid ?? null))
    return unsub
  }, [])
}
