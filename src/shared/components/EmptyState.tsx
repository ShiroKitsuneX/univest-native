import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'

type Props = {
  // Single emoji or React node rendered inside a soft circle.
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

// Generic "nothing here yet" state. Used by Feed empty, Notes empty,
// Following empty, etc. The icon lives in a soft circle keyed to `acBg`
// (the lavender halo) so it ties back to the brand primary.
export function EmptyState({ icon, title, description, action }: Props) {
  const { T, typography } = useTheme()
  return (
    <View style={styles.wrap}>
      {icon ? (
        <View style={[styles.iconCircle, { backgroundColor: T.acBg }]}>
          {typeof icon === 'string' ? (
            <Text style={styles.iconText}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
      ) : null}
      <Text style={[typography.headline, { color: T.text, textAlign: 'center' }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            typography.body,
            { color: T.sub, textAlign: 'center', marginTop: 6, maxWidth: 280 },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: { fontSize: 32 },
})
