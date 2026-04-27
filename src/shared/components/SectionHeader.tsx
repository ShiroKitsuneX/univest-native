import type { ReactNode } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  title: string
  eyebrow?: string
  right?: ReactNode
  // Vertical spacing below the section title (before the section content).
  // Default 12 — pass 0 for tight stacks.
  marginBottom?: number
}

export function SectionHeader({
  title,
  eyebrow,
  right,
  marginBottom = 12,
}: Props) {
  const { T, typography } = useTheme()
  return (
    <View style={[styles.wrap, { marginBottom }]}>
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <Text style={[typography.eyebrow, { color: T.muted, marginBottom: 4 }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[typography.headline, { color: T.text }]}>{title}</Text>
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
