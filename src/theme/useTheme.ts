import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useProfileStore } from '@/stores/profileStore'
import {
  BRAND,
  DK,
  DOMAIN_D,
  DOMAIN_L,
  LT,
  type DomainPalette,
  type ThemeColors,
} from '@/theme/palette'
import {
  elevation as elevationTokens,
  makeShadow,
  radius,
  space,
  tokens,
  typography,
  type Tokens,
  type ShadowStyle,
} from '@/theme/tokens'

export function useIsDark(): boolean {
  const colorScheme = useColorScheme()
  const theme = useProfileStore(s => s.theme)
  return theme === 'auto' ? colorScheme === 'dark' : theme === 'dark'
}

export type ThemeShadows = {
  card: ShadowStyle
  float: ShadowStyle
  // Coloured glow used by primary CTAs (theme-aware: skipped on light to keep
  // the surface clean, reduced opacity on Android).
  primary: ShadowStyle
}

export type ThemeResult = {
  T: ThemeColors
  isDark: boolean
  AT: string
  brand: typeof BRAND
  domain: DomainPalette
  tokens: Tokens
  radius: typeof radius
  space: typeof space
  typography: typeof typography
  shadow: ThemeShadows
}

export function useTheme(): ThemeResult {
  const isDark = useIsDark()
  return useMemo<ThemeResult>(
    () => ({
      T: isDark ? DK : LT,
      isDark,
      AT: isDark ? '#000' : '#fff',
      brand: BRAND,
      domain: isDark ? DOMAIN_D : DOMAIN_L,
      tokens,
      radius,
      space,
      typography,
      shadow: {
        card: elevationTokens.card,
        float: elevationTokens.float,
        // Primary glow only on dark (light surfaces look noisy with a
        // saturated coloured shadow).
        primary: isDark
          ? makeShadow(BRAND.primary, 0.45, 14, 6, 6)
          : makeShadow(BRAND.primary, 0.18, 12, 4, 3),
      },
    }),
    [isDark]
  )
}
