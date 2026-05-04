// Design tokens — theme-independent constants shared by every screen.
// Never mutate these at runtime; never branch on theme here.

import { Platform, type TextStyle } from 'react-native'

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 999,
} as const

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const

// React Native expects fontWeight as a string, so each entry is annotated as
// TextStyle to keep call-sites type-safe when spreading.
export const typography: Record<
  'display' | 'title' | 'headline' | 'body' | 'caption' | 'eyebrow',
  TextStyle
> = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.2 },
  headline: { fontSize: 17, fontWeight: '800' },
  body: { fontSize: 14, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '600' },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
}

// Platform-correct shadow recipes. Android uses `elevation`; iOS uses the
// shadow* properties. Callers spread the whole object onto a View style.
export type ShadowStyle = {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

const ios = Platform.OS === 'ios'

export function makeShadow(
  color: string,
  opacity: number,
  radiusBlur: number,
  offsetY: number,
  android: number
): ShadowStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: ios ? opacity : 0,
    shadowRadius: radiusBlur,
    elevation: android,
  }
}

// Static, theme-independent shadow recipes. Theme-aware ones (primary glow
// using the active accent) are exposed by useTheme().
export const elevation = {
  card: makeShadow('#000', 0.06, 8, 2, 2),
  float: makeShadow('#000', 0.18, 18, 8, 6),
} as const

export type Tokens = {
  radius: typeof radius
  space: typeof space
  typography: typeof typography
  elevation: typeof elevation
}

export const tokens: Tokens = { radius, space, typography, elevation }
