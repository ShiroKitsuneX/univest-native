import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { Skeleton } from './Skeleton'

type Props = {
  count?: number
  // Avatar/icon shape on the left edge. `circle` for people/uni avatars,
  // `tile` for stat-card-style rows, `none` for plain text rows.
  leading?: 'circle' | 'tile' | 'none'
  // Show the optional trailing chevron / chip placeholder on the right.
  showTrailing?: boolean
}

// Generic list-skeleton row. Sits inside a `<Card>` border so the whole
// stack already has the correct surface — keep this as just the content
// rows, not the card wrapper, so callers control padding/gap.
export function ListSkeleton({
  count = 5,
  leading = 'circle',
  showTrailing = false,
}: Props) {
  const { T, radius } = useTheme()
  return (
    <View style={{ gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.row,
            {
              backgroundColor: T.card,
              borderColor: T.border,
              borderRadius: radius.md,
            },
          ]}
        >
          {leading === 'circle' && (
            <Skeleton width={44} height={44} radius={22} />
          )}
          {leading === 'tile' && (
            <Skeleton width={36} height={36} radius={radius.sm} />
          )}
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="60%" height={13} />
            <Skeleton width="35%" height={10} />
          </View>
          {showTrailing && <Skeleton width={32} height={20} radius={10} />}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
})
