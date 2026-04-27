import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  // First name only — the hero treatment is "Olá, {name} 👋".
  name: string
  // Optional secondary line below the greeting (e.g. weekday or status).
  subtitle?: string
  emoji?: string
  right?: ReactNode
}

// Hero greeting strip used at the top of dashboard-like screens. Pairs the
// display typography with an optional right-side slot for an avatar / icon.
export function HeroGreeting({
  name,
  subtitle,
  emoji = '👋',
  right,
}: Props) {
  const { T, typography } = useTheme()
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={[typography.display, { color: T.text }]}>
          Olá, {name} {emoji}
        </Text>
        {subtitle ? (
          <Text style={[typography.body, { color: T.sub, marginTop: 4 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  right: { marginLeft: 12 },
})
