import { useCallback } from 'react'
import { useCoursesStore } from '@/stores/coursesStore'

// Reactive icon getter. Subscribes to `fbIcons` so the component re-renders
// when icons finish loading. Use this in render code instead of
// `useCoursesStore.getState().getIcon(...)` (which is non-reactive and won't
// pick up icons that load after mount).
export function useIcons(): (id: string, fallback?: string) => string {
  const fbIcons = useCoursesStore(s => s.fbIcons)
  return useCallback(
    (id, fallback = '') => fbIcons[id] || fallback,
    [fbIcons]
  )
}
