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
import type { DomainTone } from '@/theme/palette'

type Props = {
  // Soft pastel accent family — picks the icon-tile colour.
  tone: DomainTone
  icon?: ReactNode
  value: string | number
  label: string
  // Optional change indicator (e.g. "+12%" / "-3"). Coloured by sign at
  // call-site if needed; we just render the string.
  delta?: string
  deltaPositive?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function StatCard({
  tone,
  icon,
  value,
  label,
  delta,
  deltaPositive,
  onPress,
  style,
}: Props) {
  const { T, domain, radius, typography } = useTheme()
  const accent = domain[tone]

  const inner = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: T.card,
          borderColor: T.border,
          borderRadius: radius.lg,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconTile,
            { backgroundColor: accent.bg, borderRadius: radius.sm },
          ]}
        >
          {icon ? (
            icon
          ) : (
            <Text style={{ color: accent.fg, fontWeight: '800' }}>★</Text>
          )}
        </View>
        {delta ? (
          <Text
            style={{
              ...typography.caption,
              color: deltaPositive ? accent.fg : T.sub,
            }}
          >
            {delta}
          </Text>
        ) : null}
      </View>
      <Text
        style={[styles.value, typography.title, { color: T.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[typography.caption, { color: T.sub }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )

  if (!onPress) return inner
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      {inner}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    minWidth: 120,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconTile: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginBottom: 2,
  },
  pressed: { opacity: 0.85 },
})
