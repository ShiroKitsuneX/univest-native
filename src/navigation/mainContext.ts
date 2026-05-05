import { createContext, useContext } from 'react'
import type { University } from '@/stores/universitiesStore'

// Handlers and ephemeral flags App.tsx hands down through context to the
// MainTabs subtree. Optional because not every screen consumes every handler;
// missing values are surfaced as "feature not wired" via optional chaining at
// call sites.
export type MainHandlers = {
  refreshing?: boolean
  onRefresh?: () => void

  // Settings + profile chrome
  onOpenSettings?: () => void
  onChangePhoto?: () => void
  onChangeName?: () => void
  onEditCourses?: () => void

  // Universities
  onSelectUni?: (uni: University) => void
  onToggleFollow?: (uni: University, isFollowing: boolean) => void
  onOpenSort?: () => void

  // Notas / planning
  onAddGrade?: () => void
  onAddGoal?: () => void
  onOpenEvent?: (event: unknown) => void
  onOpenExam?: (exam: unknown) => void

  // Posts
  onShowSaved?: () => void
  onShare?: (post: unknown) => void

  // Notifications
  onOpenNotifications?: () => void

  // Institution authoring (chooser sheet → CreatePost / CreateStory)
  onOpenCreator?: () => void

  // Location / discovery
  onOpenLocation?: () => void
  onOpenDiscover?: () => void

  // Institution photo
  onOpenInstitutionPhoto?: () => void
}

export const MainCtx = createContext<MainHandlers | null>(null)

// Returns the active handlers map, never null when used inside MainTabs.
// The non-null assertion is safe because MainCtx.Provider is the entry point
// to every screen that calls this hook.
export const useMain = (): MainHandlers => {
  const ctx = useContext(MainCtx)
  if (!ctx) {
    throw new Error('useMain must be used inside MainCtx.Provider')
  }
  return ctx
}
