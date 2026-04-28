import {
  doc,
  getDocs,
  collection,
  deleteDoc,
  updateDoc,
  setDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

export type AppNotification = {
  id: string
  type: 'like' | 'comment' | 'follow' | 'story' | 'post' | 'reminder' | 'system'
  title: string
  body: string
  uniId?: string
  postId?: string
  read: boolean
  createdAt: Date
}

export async function fetchNotifications(
  uid: string
): Promise<AppNotification[]> {
  if (!uid) return []
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  if (snap.empty) return []
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as AppNotification[]
}

export async function fetchUnreadCount(uid: string): Promise<number> {
  if (!uid) return 0
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', uid),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  return snap.size
}

export async function markAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) return
  const notificationPath = firestorePaths.notification(userId, notificationId)
  await updateDoc(doc(db, getPath(...notificationPath)), { read: true })
}

export async function markAllAsRead(userId: string): Promise<void> {
  if (!userId) return
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  const updates = snap.docs.map(d =>
    updateDoc(doc(db, getPath(...firestorePaths.notification(userId, d.id))), {
      read: true,
    })
  )
  await Promise.all(updates)
}

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!userId || !notificationId) return
  const notificationPath = firestorePaths.notification(userId, notificationId)
  await deleteDoc(doc(db, getPath(...notificationPath)))
}

export type CreateNotificationInput = {
  userId: string
  type: AppNotification['type']
  title: string
  body: string
  uniId?: string
  postId?: string
  createdBy?: string
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<string> {
  const { userId, type, title, body, uniId, postId, createdBy } = input
  if (!userId || !title || !body) return ''

  const ref = doc(collection(db, 'notifications'))
  const notificationData = {
    userId,
    type,
    title,
    body,
    uniId: uniId || null,
    postId: postId || null,
    read: false,
    createdBy: createdBy || null,
    createdAt: new Date(),
    id: ref.id,
  }

  await setDoc(ref, notificationData)
  return ref.id
}
