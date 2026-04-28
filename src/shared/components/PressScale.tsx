import { useRef, type ReactNode } from 'react'
import {
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

type Props = {
  children: ReactNode
  onPress?: () => void
  onLongPress?: () => void
  // How far the element shrinks on press. 0.97 is a barely-perceptible nudge
  // (cards, list rows). 0.93 is more pronounced (icon buttons).
  scaleTo?: number
  // Disables both the press handlers and the spring animation. Useful when a
  // parent wants to gate interactivity without unmounting the wrapper.
  disabled?: boolean
  hitSlop?: number
  style?: StyleProp<ViewStyle>
  // Pass-through for accessibility — when present we let the platform speak
  // it instead of falling back to the visual content.
  accessibilityLabel?: string
}

// Drop-in tap-and-spring wrapper. Use anywhere a Touchable or Pressable would
// go — replaces ad-hoc `Animated.spring` calls and keeps the press feel
// consistent across the app.
export function PressScale({
  children,
  onPress,
  onLongPress,
  scaleTo = 0.97,
  disabled = false,
  hitSlop,
  style,
  accessibilityLabel,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start()
  }
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start()
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onLongPress={disabled ? undefined : onLongPress}
        onPressIn={disabled ? undefined : onPressIn}
        onPressOut={disabled ? undefined : onPressOut}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}
