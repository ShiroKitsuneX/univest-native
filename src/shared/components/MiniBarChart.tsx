import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

export type BarPoint = {
  // Short label rendered below the bar (e.g. "Mon", "S1"). Keep ≤ 4 chars.
  label: string
  // Numeric value used to compute height. Same scale across all bars.
  value: number
  // Optional caption shown above the highlighted bar. If `highlighted` is
  // true on more than one point only the last wins (single floating tag).
  caption?: string
  highlighted?: boolean
}

type Props = {
  data: BarPoint[]
  height?: number
  // Optional max — if omitted we compute it from `data`. Pass when you want
  // a fixed scale (e.g. 0–1000 for ENEM scores) so adding low data points
  // doesn't visually rescale every bar.
  max?: number
}

// Vertical bar chart with rounded violet bars, soft inactive bars, and an
// optional floating tag over the highlighted bar. Replaces `react-native-
// chart-kit`'s `BarChart` for our dashboard hero — chart-kit's defaults
// look dated and don't theme cleanly.
export function MiniBarChart({ data, height = 140, max }: Props) {
  const { T, brand, radius, typography } = useTheme()

  const { rows, computedMax } = useMemo(() => {
    const m = max ?? Math.max(...data.map(d => d.value), 1)
    return {
      rows: data,
      computedMax: m,
    }
  }, [data, max])

  // Reserve room for the label strip below + the floating-tag space above.
  const labelStripH = 18
  const tagH = 20
  const usableH = height - labelStripH - tagH

  return (
    <View style={[styles.wrap, { height }]}>
      {rows.map((d, i) => {
        const ratio = Math.max(0.04, d.value / computedMax) // floor so empty bars are still visible
        const barH = Math.round(usableH * ratio)
        const active = !!d.highlighted
        return (
          <View key={i} style={styles.col}>
            <View style={[styles.tagSlot, { height: tagH }]}>
              {active && d.caption ? (
                <View
                  style={[
                    styles.tag,
                    { backgroundColor: brand.primary, borderRadius: radius.sm },
                  ]}
                >
                  <Text style={styles.tagText}>{d.caption}</Text>
                </View>
              ) : null}
            </View>
            <View style={[styles.barTrack, { height: usableH }]}>
              <View
                style={{
                  width: 18,
                  height: barH,
                  borderRadius: 9,
                  backgroundColor: active ? brand.primary : T.acBg,
                }}
              />
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: active ? T.text : T.muted,
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: active ? '700' : '500',
                },
              ]}
            >
              {d.label}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  tagSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  barTrack: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
})
