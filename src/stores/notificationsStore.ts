import { create } from 'zustand'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  type AppNotification,
} from '@/features/feed/repositories/notificationsRepository'

type NotificationsState = {
  notifications: AppNotification[]
  unreadCount: number
  loaded: boolean
  loading: boolean

  load: (uid: string) => Promise<void>
  loadUnreadCount: (uid: string) => Promise<void>
  markAsRead: (userId: string, notificationId: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  deleteNotification: (userId: string, notificationId: string) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loaded: false,
  loading: false,

  load: async (uid: string) => {
    if (!uid) return
    set({ loading: true })
    try {
      const notifications = await fetchNotifications(uid)
      set({ notifications, loaded: true, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  loadUnreadCount: async (uid: string) => {
    if (!uid) return
    const unreadCount = await fetchUnreadCount(uid)
    set({ unreadCount })
  },

  markAsRead: async (userId: string, notificationId: string) => {
    if (!userId || !notificationId) return
    await markAsRead(userId, notificationId)
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async (userId: string) => {
    if (!userId) return
    await markAllAsRead(userId)
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }))
  },

  deleteNotification: async (userId: string, notificationId: string) => {
    if (!userId || !notificationId) return
    await deleteNotification(userId, notificationId)
    set(state => {
      const deleted = state.notifications.find(n => n.id === notificationId)
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount:
          deleted && !deleted.read ? state.unreadCount - 1 : state.unreadCount,
      }
    })
  },
}))
