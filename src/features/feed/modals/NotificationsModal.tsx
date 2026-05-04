import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/useTheme'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useAuthStore } from '@/stores/authStore'
import { timeAgo } from '@/utils/format'
import {
  EmptyState,
  Pill,
  Skeleton,
} from '@/shared/components'
import type { AppNotification, NotificationType } from '@/features/feed/repositories/notificationsRepository'
import type { DomainTone } from '@/theme/palette'

// Visual mapping per notification type. Each type gets a glyph, a domain
// pastel for its icon tile, and (where relevant) a verb that prefixes the
// title in the row. Keep emojis here — they're glanceable and we don't have
// a 1:1 SVG icon for every notification semantic.
const TYPE_VISUALS: Record<
  NotificationType,
  { glyph: string; tone: DomainTone }
> = {
  like: { glyph: '❤️', tone: 'news' },
  comment: { glyph: '💬', tone: 'notas' },
  follow: { glyph: '👥', tone: 'progress' },
  story: { glyph: '📸', tone: 'simulado' },
  post: { glyph: '📝', tone: 'progress' },
  reminder: { glyph: '⏰', tone: 'goal' },
  exam: { glyph: '🎯', tone: 'goal' },
  system: { glyph: '🔔', tone: 'progress' },
  welcome: { glyph: '👋', tone: 'progress' },
  follower_milestone: { glyph: '🏆', tone: 'goal' },
  post_engagement: { glyph: '📈', tone: 'news' },
  story_view_milestone: { glyph: '👀', tone: 'simulado' },
}

type Filter = 'all' | 'unread'

type NavTarget = { uniId?: string; postId?: string }

type Props = {
  visible: boolean
  onClose: () => void
  onSelect?: (target: NavTarget) => void
}

export function NotificationsModal({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets()
  const { T, isDark, brand, domain, radius, typography } = useTheme()
  const currentUser = useAuthStore(s => s.currentUser)
  const userId = currentUser?.uid

  const notifications = useNotificationsStore(s => s.notifications)
  const unreadCount = useNotificationsStore(s => s.unreadCount)
  const loading = useNotificationsStore(s => s.loading)
  const refreshing = useNotificationsStore(s => s.refreshing)
  const error = useNotificationsStore(s => s.error)
  const load = useNotificationsStore(s => s.load)
  const refresh = useNotificationsStore(s => s.refresh)
  const markAsRead = useNotificationsStore(s => s.markAsRead)
  const markAllAsRead = useNotificationsStore(s => s.markAllAsRead)
  const deleteNotification = useNotificationsStore(s => s.deleteNotification)
  const deleteAllRead = useNotificationsStore(s => s.deleteAllRead)

  const [filter, setFilter] = useState<Filter>('all')

  // Load whenever the modal becomes visible. Cheap if data is already cached
  // — the store keeps state across opens so the user sees the previous list
  // immediately while a background refresh updates it.
  useEffect(() => {
    if (visible && userId) {
      load(userId)
    }
  }, [visible, userId, load])

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter(n => !n.read)
    return notifications
  }, [notifications, filter])

  const onRefresh = () => {
    if (userId) refresh(userId)
  }

  const handlePress = (n: AppNotification) => {
    if (!n.read) markAsRead(n.id)
    if (onSelect && (n.uniId || n.postId)) {
      onClose()
      onSelect({ uniId: n.uniId, postId: n.postId })
    }
  }

  const handleLongPress = (n: AppNotification) => {
    Alert.alert(
      'Notificação',
      n.title,
      [
        { text: 'Cancelar', style: 'cancel' },
        ...(n.read
          ? []
          : [
              {
                text: 'Marcar como lida',
                onPress: () => markAsRead(n.id),
              },
            ]),
        {
          text: 'Excluir',
          style: 'destructive' as const,
          onPress: () => deleteNotification(n.id),
        },
      ]
    )
  }

  const handleClearRead = () => {
    if (!userId) return
    Alert.alert(
      'Limpar lidas',
      'Remover todas as notificações já lidas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => deleteAllRead(userId),
        },
      ]
    )
  }

  const handleMarkAllRead = () => {
    if (userId && unreadCount > 0) markAllAsRead(userId)
  }

  const showSkeleton = loading && notifications.length === 0
  const showEmpty = !loading && filtered.length === 0
  const hasReadItems = notifications.some(n => n.read)

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        {/* Header — back arrow + title + overflow menu. Matches the rest of
            the redesign's screen-owns-its-top pattern. */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 8,
              borderBottomColor: T.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.iconBtn,
              { backgroundColor: T.card2, borderColor: T.border },
            ]}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            <Text style={{ color: T.text, fontSize: 18, fontWeight: '700' }}>
              ←
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.title, { color: T.text, fontSize: 22 }]}>
              Notificações
            </Text>
            {unreadCount > 0 && (
              <Text style={{ color: T.sub, fontSize: 12, marginTop: 2 }}>
                {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
              </Text>
            )}
          </View>
          {hasReadItems && (
            <TouchableOpacity
              onPress={handleClearRead}
              style={[
                styles.iconBtn,
                { backgroundColor: T.card2, borderColor: T.border },
              ]}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <Text style={{ fontSize: 16 }}>🧹</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips + bulk action */}
        <View style={styles.filterBar}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pill
              size="sm"
              active={filter === 'all'}
              onPress={() => setFilter('all')}
            >
              {`Todas · ${notifications.length}`}
            </Pill>
            <Pill
              size="sm"
              active={filter === 'unread'}
              onPress={() => setFilter('unread')}
            >
              {`Não lidas · ${unreadCount}`}
            </Pill>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead}>
              <Text
                style={{
                  color: brand.primary,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Marcar todas
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {error && (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: T.acBg, borderColor: brand.primary + '40' },
            ]}
          >
            <Text style={{ color: T.text, fontSize: 12 }}>⚠️ {error}</Text>
          </View>
        )}

        {showSkeleton ? (
          <View style={{ padding: 20, gap: 12 }}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                <Skeleton width={44} height={44} radius={radius.sm} />
                <View style={{ flex: 1, gap: 6, paddingTop: 4 }}>
                  <Skeleton width="60%" height={12} />
                  <Skeleton width="90%" height={10} />
                  <Skeleton width="30%" height={9} />
                </View>
              </View>
            ))}
          </View>
        ) : showEmpty ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyState
              icon={filter === 'unread' ? '✅' : '🔔'}
              title={
                filter === 'unread'
                  ? 'Tudo em dia'
                  : 'Nenhuma notificação'
              }
              description={
                filter === 'unread'
                  ? 'Você leu todas as suas notificações.'
                  : 'Quando algo importante acontecer, aparecerá aqui.'
              }
            />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={n => n.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: insets.bottom + 24,
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={brand.primary}
                colors={[brand.primary]}
              />
            }
            renderItem={({ item }) => {
              const visuals = TYPE_VISUALS[item.type] || TYPE_VISUALS.system
              const accent = domain[visuals.tone]
              return (
                <TouchableOpacity
                  onPress={() => handlePress(item)}
                  onLongPress={() => handleLongPress(item)}
                  delayLongPress={350}
                  activeOpacity={0.85}
                  style={[
                    styles.row,
                    {
                      backgroundColor: item.read ? T.card : T.acBg,
                      borderColor: item.read ? T.border : brand.primary + '40',
                      borderRadius: radius.lg,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconTile,
                      {
                        backgroundColor: accent.bg,
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{visuals.glyph}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.titleRow}>
                      <Text
                        style={{
                          color: T.text,
                          fontSize: 14,
                          fontWeight: item.read ? '600' : '800',
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {!item.read && (
                        <View
                          style={[
                            styles.unreadDot,
                            { backgroundColor: brand.primary },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        color: T.sub,
                        fontSize: 13,
                        lineHeight: 18,
                        marginTop: 2,
                      }}
                      numberOfLines={2}
                    >
                      {item.body}
                    </Text>
                    <Text
                      style={{
                        color: T.muted,
                        fontSize: 11,
                        marginTop: 6,
                        fontWeight: '600',
                      }}
                    >
                      {timeAgo(item.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
  },
  iconTile: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})
