import type { ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  children: ReactNode
  active?: boolean
  onPress?: () => void
  leftIcon?: ReactNode
  size?: 'sm' | 'md'
  style?: StyleProp<ViewStyle>
}

const SIZES = {
  sm: { py: 5, px: 12, fs: 12 },
  md: { py: 7, px: 14, fs: 13 },
}

export function Pill({
  children,
  active = false,
  onPress,
  leftIcon,
  size = 'md',
  style,
}: Props) {
  const { T, brand, radius } = useTheme()
  const dims = SIZES[size]

  const bg = active ? brand.primary : T.card2
  const fg = active ? '#FFFFFF' : T.sub
  const border = active ? brand.primary : T.border

  const inner = (
    <View
      style={[
        styles.row,
        {
          paddingVertical: dims.py,
          paddingHorizontal: dims.px,
          borderRadius: radius.full,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
        },
        style,
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      <Text style={{ color: fg, fontSize: dims.fs, fontWeight: '600' }}>
        {children}
      </Text>
    </View>
  )

  if (!onPress) return inner

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      {inner}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 6 },
  pressed: { opacity: 0.8 },
})
