import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import { useTheme } from '@/theme/useTheme'
import { BottomSheet } from '@/components/BottomSheet'
import { useNotificationsStore } from '@/stores/notificationsStore'
import { useAuthStore } from '@/stores/authStore'
import { timeAgo } from '@/utils/format'

const NOTIFICATION_ICONS: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  follow: '👤',
  story: '📸',
  post: '📝',
  reminder: '⏰',
  system: '🔔',
}

export function NotificationsModal({ visible, onClose }) {
  const { T } = useTheme()
  const currentUser = useAuthStore(s => s.currentUser)
  const notifications = useNotificationsStore(s => s.notifications)
  const unreadCount = useNotificationsStore(s => s.unreadCount)
  const load = useNotificationsStore(s => s.load)
  const loadUnreadCount = useNotificationsStore(s => s.loadUnreadCount)
  const markAsRead = useNotificationsStore(s => s.markAsRead)
  const markAllAsRead = useNotificationsStore(s => s.markAllAsRead)
  const deleteNotification = useNotificationsStore(s => s.deleteNotification)

  const userId = currentUser?.uid

  const handleOpenNotifications = () => {
    if (userId) {
      load(userId)
      loadUnreadCount(userId)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (userId) {
      await markAsRead(userId, notificationId)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (userId) {
      await markAllAsRead(userId)
    }
  }

  const handleDelete = async (notificationId: string) => {
    if (userId) {
      await deleteNotification(userId, notificationId)
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} T={T} height={70}>
      <View style={styles.container} onTouchStart={handleOpenNotifications}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: T.text }]}>
            Notificações
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={[styles.markAllText, { color: T.accent }]}>
                Marcar tudo como lido
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🔔</Text>
              <Text style={[styles.emptyText, { color: T.sub }]}>
                Nenhuma notificação ainda
              </Text>
            </View>
          ) : (
            notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleMarkAsRead(notification.id)}
                onLongPress={() => handleDelete(notification.id)}
                style={[
                  styles.notificationItem,
                  {
                    backgroundColor: notification.read
                      ? 'transparent'
                      : T.card2,
                  },
                ]}
              >
                <Text style={styles.notificationIcon}>
                  {NOTIFICATION_ICONS[notification.type] || '🔔'}
                </Text>
                <View style={styles.notificationContent}>
                  <Text
                    style={[styles.notificationTitle, { color: T.text }]}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                  <Text
                    style={[styles.notificationBody, { color: T.sub }]}
                    numberOfLines={2}
                  >
                    {notification.body}
                  </Text>
                  <Text style={[styles.notificationTime, { color: T.muted }]}>
                    {timeAgo(notification.createdAt)}
                  </Text>
                </View>
                {!notification.read && (
                  <View
                    style={[styles.unreadBadge, { backgroundColor: T.accent }]}
                  />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800' as const,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  notificationBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    marginTop: 4,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
})
