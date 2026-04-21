import { useEffect } from "react";
import { loadLocalUserData, saveLocalUserData } from "../services/storage";
import { onAuthChange } from "../services/auth";
import { fetchUserDoc } from "../services/firestore";
import { useAuthStore } from "../stores/authStore";
import { useProfileStore } from "../stores/profileStore";
import { useOnboardingStore } from "../stores/onboardingStore";
import { useProgressStore } from "../stores/progressStore";
import { usePostsStore } from "../stores/postsStore";
import { useUniversitiesStore } from "../stores/universitiesStore";
import { useCoursesStore } from "../stores/coursesStore";
import { useGeoStore } from "../stores/geoStore";

export function useBootstrap() {
  useEffect(() => {
    loadLocalUserData().then(localData => {
      if (localData) {
        useOnboardingStore.getState().hydrateFromLocal(localData);
        useProfileStore.getState().hydrate(localData);
        useProgressStore.getState().hydrate(localData);
        usePostsStore.getState().hydrate(localData);
      }
      useAuthStore.getState().setBootstrapped(true);
    });
  }, []);

  useEffect(() => {
    const { setCurrentUser, setUserData, setAuthLoading } = useAuthStore.getState();
    const { setStep, setDone } = useOnboardingStore.getState();
    const unsub = onAuthChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const fbData = await fetchUserDoc(user.uid);
          if (fbData) {
            await saveLocalUserData(fbData);
            setUserData(fbData);
            useOnboardingStore.getState().hydrateFromFb(fbData);
            useProfileStore.getState().hydrate(fbData);
            useProgressStore.getState().hydrate(fbData);
            usePostsStore.getState().hydrate(fbData);
            useUniversitiesStore.getState().hydrate(fbData);
          } else {
            setUserData({ followedUnis: [] });
            setStep(1); setDone(false);
          }
        } catch (e) { console.log("Error loading user data:", e.message); }
      } else { setCurrentUser(null); setUserData(null); }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    useCoursesStore.getState().load();
    useGeoStore.getState().load();
    useUniversitiesStore.getState().load();
  }, []);

  const fbUnis = useUniversitiesStore(s => s.fbUnis);
  const userData = useAuthStore(s => s.userData);
  useEffect(() => {
    useUniversitiesStore.getState().applyFollowedUnis(userData?.followedUnis);
  }, [fbUnis, userData]);

  const currentUser = useAuthStore(s => s.currentUser);
  useEffect(() => {
    (async () => {
      await usePostsStore.getState().load();
      if (currentUser) await usePostsStore.getState().loadLikesFor(currentUser.uid);
    })();
  }, [currentUser]);
}
