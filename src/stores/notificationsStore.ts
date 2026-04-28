import { create } from 'zustand'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead as repoMarkAsRead,
  markAllAsRead as repoMarkAllAsRead,
  deleteNotification as repoDeleteNotification,
  deleteAllRead as repoDeleteAllRead,
  type AppNotification,
} from '@/features/feed/repositories/notificationsRepository'
import { logger } from '@/services/logger'

type NotificationsState = {
  notifications: AppNotification[]
  unreadCount: number
  loaded: boolean
  loading: boolean
  refreshing: boolean
  error: string | null

  load: (uid: string) => Promise<void>
  refresh: (uid: string) => Promise<void>
  loadUnreadCount: (uid: string) => Promise<void>

  // Repo signatures changed: notification id is sufficient (flat
  // `notifications/{id}` collection), no need to pass uid through.
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (uid: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  deleteAllRead: (uid: string) => Promise<void>

  reset: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loaded: false,
  loading: false,
  refreshing: false,
  error: null,

  load: async uid => {
    if (!uid) return
    // Don't show full-screen loading if we already have data — keep the
    // existing list visible and let `refreshing` drive the spinner instead.
    const hasData = get().loaded
    set({ loading: !hasData, refreshing: hasData, error: null })
    try {
      const [notifications, unreadCount] = await Promise.all([
        fetchNotifications(uid),
        fetchUnreadCount(uid),
      ])
      set({
        notifications,
        unreadCount,
        loaded: true,
        loading: false,
        refreshing: false,
      })
    } catch (e) {
      logger.warn('notifications load error', e)
      set({
        loading: false,
        refreshing: false,
        error: 'Não foi possível carregar as notificações',
      })
    }
  },

  refresh: async uid => {
    if (!uid) return
    set({ refreshing: true, error: null })
    try {
      const [notifications, unreadCount] = await Promise.all([
        fetchNotifications(uid),
        fetchUnreadCount(uid),
      ])
      set({ notifications, unreadCount, refreshing: false, loaded: true })
    } catch (e) {
      logger.warn('notifications refresh error', e)
      set({ refreshing: false, error: 'Falha ao atualizar' })
    }
  },

  loadUnreadCount: async uid => {
    if (!uid) return
    try {
      const unreadCount = await fetchUnreadCount(uid)
      set({ unreadCount })
    } catch (e) {
      logger.warn('notifications unread count error', e)
    }
  },

  markAsRead: async notificationId => {
    if (!notificationId) return
    // Optimistic update — flip in-memory state first, roll back on error.
    const prev = get().notifications
    const target = prev.find(n => n.id === notificationId)
    if (!target || target.read) return
    set({
      notifications: prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, get().unreadCount - 1),
    })
    try {
      await repoMarkAsRead(notificationId)
    } catch (e) {
      logger.warn('markAsRead failed, rolling back', e)
      set({ notifications: prev, unreadCount: get().unreadCount + 1 })
    }
  },

  markAllAsRead: async uid => {
    if (!uid) return
    const prev = get().notifications
    const prevUnread = get().unreadCount
    set({
      notifications: prev.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    })
    try {
      await repoMarkAllAsRead(uid)
    } catch (e) {
      logger.warn('markAllAsRead failed, rolling back', e)
      set({ notifications: prev, unreadCount: prevUnread })
    }
  },

  deleteNotification: async notificationId => {
    if (!notificationId) return
    const prev = get().notifications
    const prevUnread = get().unreadCount
    const target = prev.find(n => n.id === notificationId)
    set({
      notifications: prev.filter(n => n.id !== notificationId),
      unreadCount:
        target && !target.read ? Math.max(0, prevUnread - 1) : prevUnread,
    })
    try {
      await repoDeleteNotification(notificationId)
    } catch (e) {
      logger.warn('deleteNotification failed, rolling back', e)
      set({ notifications: prev, unreadCount: prevUnread })
    }
  },

  deleteAllRead: async uid => {
    if (!uid) return
    const prev = get().notifications
    set({ notifications: prev.filter(n => !n.read) })
    try {
      await repoDeleteAllRead(uid)
    } catch (e) {
      logger.warn('deleteAllRead failed, rolling back', e)
      set({ notifications: prev })
    }
  },

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      loaded: false,
      loading: false,
      refreshing: false,
      error: null,
    }),
}))
