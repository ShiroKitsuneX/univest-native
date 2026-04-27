import { useMemo, useRef, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

type Props = {
  onPress?: () => void
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
}

// Heights are tuned so primary and secondary line up next to each other.
const SIZES: Record<ButtonSize, { h: number; px: number; fs: number }> = {
  sm: { h: 36, px: 14, fs: 13 },
  md: { h: 48, px: 18, fs: 15 },
  lg: { h: 56, px: 22, fs: 16 },
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
}: Props) {
  const { T, brand, radius, shadow } = useTheme()
  const dims = SIZES[size]

  // Press-scale spring. Subtle 0.97 — enough to feel tactile, not a wobble.
  const scale = useRef(new Animated.Value(1)).current
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()

  const { containerStyle, textStyle } = useMemo(() => {
    const base: ViewStyle = {
      height: dims.h,
      paddingHorizontal: dims.px,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    }
    if (variant === 'primary') {
      return {
        containerStyle: [
          base,
          { backgroundColor: brand.primary },
          shadow.primary,
        ] as StyleProp<ViewStyle>,
        textStyle: { color: '#FFFFFF', fontSize: dims.fs, fontWeight: '700' as TextStyle['fontWeight'] },
      }
    }
    if (variant === 'secondary') {
      return {
        containerStyle: [
          base,
          {
            backgroundColor: T.card2,
            borderWidth: 1,
            borderColor: T.border,
          },
        ] as StyleProp<ViewStyle>,
        textStyle: { color: T.text, fontSize: dims.fs, fontWeight: '700' as TextStyle['fontWeight'] },
      }
    }
    // ghost
    return {
      containerStyle: [base, { backgroundColor: 'transparent' }] as StyleProp<ViewStyle>,
      textStyle: { color: T.accent, fontSize: dims.fs, fontWeight: '700' as TextStyle['fontWeight'] },
    }
  }, [variant, dims, radius.md, fullWidth, brand.primary, shadow.primary, T.card2, T.border, T.text, T.accent])

  const inactive = disabled || loading

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && { alignSelf: 'stretch' }, style]}>
      <Pressable
        onPress={inactive ? undefined : onPress}
        onPressIn={inactive ? undefined : onPressIn}
        onPressOut={inactive ? undefined : onPressOut}
        style={({ pressed }) => [
          containerStyle,
          pressed && !inactive && styles.pressed,
          inactive && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : T.accent} />
        ) : (
          <>
            {leftIcon ? <View>{leftIcon}</View> : null}
            <Text style={textStyle} numberOfLines={1}>
              {children}
            </Text>
            {rightIcon ? <View>{rightIcon}</View> : null}
          </>
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.5 },
})
