import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'

type PageHeaderProps = {
  title: string
  onBack?: () => void
  showBack?: boolean
  right?: React.ReactNode
  subtitle?: string
}

export function PageHeader({
  title,
  onBack,
  showBack = true,
  right,
  subtitle,
}: PageHeaderProps) {
  const insets = useSafeAreaInsets()
  const { T } = useTheme()

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
          backgroundColor: T.bg,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack && onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.backArrow, { color: T.sub }]}>←</Text>
              <Text style={[styles.backText, { color: T.sub }]}> Voltar</Text>
            </TouchableOpacity>
          )}
          {!showBack && <View style={{ width: 60 }} />}
        </View>

        <View style={styles.center}>
          <Text style={[styles.title, { color: T.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: T.sub }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.right}>
          {right || <View style={{ width: 60 }} />}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    width: 60,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 60,
    alignItems: 'flex-end',
  },
  backButton: {
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 16,
    marginRight: 2,
  },
  backText: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
})
