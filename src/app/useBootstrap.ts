import { useEffect, useRef } from 'react'
import { loadLocalUserData, saveLocalUserData } from '@/services/storage'
import { onAuthChange } from '@/services/auth'
import { fetchUserProfile } from '@/features/auth/repositories/authRepository'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useOnboardingStore } from '@/stores/onboardingStore'
import { useProgressStore } from '@/stores/progressStore'
import { usePostsStore } from '@/stores/postsStore'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useGeoStore } from '@/stores/geoStore'
import { logger } from '@/services/logger'

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
              setDone(true)
              setStep(3)
              setUType(null)
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

  useEffect(() => {
    const currentUser = useAuthStore.getState().currentUser
    if (!currentUser) return
    ;(async () => {
      await usePostsStore.getState().load()
      await usePostsStore.getState().loadLikesFor(currentUser.uid)
    })()
  }, [])
}
