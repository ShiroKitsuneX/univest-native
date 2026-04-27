import type { ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  children: ReactNode
  tone?: 'default' | 'highlight' | 'flat'
  padding?: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

// Standard card surface. `default` matches the Phase-1 `useCardStyle`
// (border + bg). `highlight` adds a soft shadow for hero cards. `flat`
// drops the border for tight inner blocks (e.g. inside a section).
export function Card({
  children,
  tone = 'default',
  padding = 16,
  radius,
  style,
}: Props) {
  const { T, radius: r, shadow } = useTheme()

  const base: ViewStyle = {
    backgroundColor: T.card,
    borderRadius: radius ?? r.lg,
    padding,
  }
  if (tone === 'flat') {
    return <View style={[base, style]}>{children}</View>
  }
  const themed: ViewStyle = {
    ...base,
    borderWidth: 1,
    borderColor: T.border,
  }
  if (tone === 'highlight') {
    return <View style={[themed, shadow.card, style]}>{children}</View>
  }
  return <View style={[themed, style]}>{children}</View>
}
