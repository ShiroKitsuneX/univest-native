import { useMemo } from 'react'
import type { ViewStyle, TextStyle } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { radius as radiusTokens, typography } from '@/theme/tokens'

export type CardStyle = (extra?: ViewStyle) => ViewStyle

// Standard card surface used across screens and modals.
// `r` defaults to `radius.lg` (most screens). Pass `radius.md` for tighter
// detail/admin variants. `extra` lets callers override or extend specific
// properties at the call site.
export function useCardStyle(r: number = radiusTokens.lg): CardStyle {
  const { T } = useTheme()
  return useMemo<CardStyle>(
    () =>
      (extra = {}) => ({
        backgroundColor: T.card,
        borderRadius: r,
        borderWidth: 1,
        borderColor: T.border,
        ...extra,
      }),
    [T.card, T.border, r]
  )
}

// Uppercase-label style used for section headers within a screen.
// Matches the `eyebrow` typography token so labels stay consistent app-wide.
export function useLabelStyle(): TextStyle {
  const { T } = useTheme()
  return useMemo<TextStyle>(
    () => ({
      color: T.muted,
      ...typography.eyebrow,
    }),
    [T.muted]
  )
}
