import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  days: number
  // Short label suffix; defaults to Brazilian Portuguese for vestibular app.
  label?: string
}

// Compact streak indicator: lightning bolt + count, primary text on a
// lavender halo. Used in hero strips, profile, and dashboard tops.
export function StreakBadge({ days, label = 'dias seguidos' }: Props) {
  const { T, brand, radius } = useTheme()
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: T.acBg,
          borderRadius: radius.full,
        },
      ]}
    >
      <Text style={[styles.bolt, { color: brand.primary }]}>⚡</Text>
      <Text style={[styles.count, { color: brand.primary }]}>{days}</Text>
      <Text style={[styles.label, { color: T.sub }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  bolt: { fontSize: 14, marginRight: 4 },
  count: { fontSize: 14, fontWeight: '800', marginRight: 6 },
  label: { fontSize: 12, fontWeight: '600' },
})
