import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { SvgIcon } from './SvgIcon'

type Props = {
  active: boolean
  size?: number
  // Active colour of the filled heart. Defaults to a standard red so the
  // social affordance reads correctly regardless of the brand violet.
  activeColor?: string
  inactiveColor: string
}

// Heart icon that pops when toggled active. The pop is a quick scale
// 1 → 1.35 → 1 with a small overshoot, matching the social-app like
// pattern. Inactive→active runs the pop; active→inactive just swaps the
// colour without animating (deliberate — un-liking shouldn't celebrate).
export function AnimatedHeart({
  active,
  size = 18,
  activeColor = '#F87171',
  inactiveColor,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current
  const previousActive = useRef(active)

  useEffect(() => {
    if (active && !previousActive.current) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 12,
        }),
      ]).start()
    }
    previousActive.current = active
  }, [active, scale])

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <SvgIcon
          name="heart"
          size={size}
          color={active ? activeColor : inactiveColor}
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
})
