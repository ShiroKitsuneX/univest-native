import { useEffect, useRef } from 'react'
import { Animated, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  width?: number | `${number}%`
  height?: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

// Soft pulsing placeholder for loading states. Uses RN `Animated` with a
// looping opacity oscillation between `card2` and `border` so it reads on
// both themes without flashing. Keep durations long enough not to be a
// distraction (1200ms each direction).
export function Skeleton({
  width = '100%',
  height = 14,
  radius,
  style,
}: Props) {
  const { T, radius: r } = useTheme()
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [anim])

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [T.card2, T.border],
  })

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius ?? r.sm, backgroundColor },
        style,
      ]}
    />
  )
}
