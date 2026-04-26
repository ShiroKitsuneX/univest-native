import { useMemo } from 'react'
import type { ViewStyle, TextStyle } from 'react-native'
import { useTheme } from '@/theme/useTheme'

export type CardStyle = (extra?: ViewStyle) => ViewStyle

// Standard card surface used across screens and modals.
// `radius` defaults to 18 (most screens); pass 14 for the tighter detail/admin variants.
// `extra` lets callers override or extend specific properties at the call site.
export function useCardStyle(radius = 18): CardStyle {
  const { T } = useTheme()
  return useMemo<CardStyle>(
    () =>
      (extra = {}) => ({
        backgroundColor: T.card,
        borderRadius: radius,
        borderWidth: 1,
        borderColor: T.border,
        ...extra,
      }),
    [T.card, T.border, radius]
  )
}

// Uppercase-label style used for section headers within a screen.
export function useLabelStyle(): TextStyle {
  const { T } = useTheme()
  return useMemo<TextStyle>(
    () => ({
      color: T.muted,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    }),
    [T.muted]
  )
}
