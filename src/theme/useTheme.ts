import { useColorScheme } from 'react-native'
import { useProfileStore } from '@/stores/profileStore'
import { DK, LT, type ThemeColors } from '@/theme/palette'

export function useIsDark(): boolean {
  const colorScheme = useColorScheme()
  const theme = useProfileStore(s => s.theme)
  return theme === 'auto' ? colorScheme === 'dark' : theme === 'dark'
}

export type ThemeResult = {
  T: ThemeColors
  isDark: boolean
  AT: string
}

export function useTheme(): ThemeResult {
  const isDark = useIsDark()
  return {
    T: isDark ? DK : LT,
    isDark,
    AT: isDark ? '#000' : '#fff',
  }
}
