import { createContext, useContext } from 'react'

export type MainHandlers = {
  refreshing?: boolean
  onRefresh?: () => void
  onOpenSettings?: () => void
  onSelectUni?: (u: unknown) => void
  onToggleFollow?: () => void
  onChangePhoto?: () => void
  onChangeName?: () => void
  onEditCourses?: () => void
  onAddGrade?: () => void
  onAddGoal?: () => void
  onOpenEvent?: (e: unknown) => void
  onShowSaved?: () => void
  onShare?: (p: unknown) => void
  onOpenLocation?: () => void
  onOpenDiscover?: () => void
  onOpenSort?: () => void
  onOpenExam?: (e: unknown) => void
  [key: string]: unknown
}

export const MainCtx = createContext<MainHandlers | null>(null)
export const useMain = (): MainHandlers => useContext(MainCtx) as MainHandlers
