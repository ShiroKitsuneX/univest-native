import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { Skeleton } from './Skeleton'

type Props = {
  // Number of placeholder cards to render. Default 3 — enough to fill a
  // typical above-the-fold viewport without overcommitting.
  count?: number
  // Toggle the leading 28×28 stat-card avatar tile. Defaults on for feed.
  showAvatar?: boolean
}

// Skeleton stack mimicking the post-card shape: avatar + name/time + title
// + body + footer action row. Used while `posts` are loading.
export function FeedSkeleton({ count = 3, showAvatar = true }: Props) {
  const { T, radius } = useTheme()
  return (
    <View style={{ paddingHorizontal: 16, gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.card,
            {
              backgroundColor: T.card,
              borderColor: T.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <View style={styles.headerRow}>
            {showAvatar && (
              <Skeleton width={44} height={44} radius={22} />
            )}
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="55%" height={12} />
              <Skeleton width="30%" height={10} />
            </View>
            <Skeleton width={48} height={20} radius={radius.full} />
          </View>
          <View style={{ gap: 8, marginTop: 4 }}>
            <Skeleton width="90%" height={14} />
            <Skeleton width="100%" height={10} />
            <Skeleton width="80%" height={10} />
          </View>
          <View style={[styles.footer, { borderTopColor: T.border }]}>
            <Skeleton width={56} height={14} />
            <Skeleton width={56} height={14} />
            <View style={{ flex: 1 }} />
            <Skeleton width={20} height={20} radius={4} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 4,
  },
})
