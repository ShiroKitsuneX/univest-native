import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/core/firebase/client'
import { firestorePaths, getPath } from '@/core/firebase/firestorePaths'

// Notifications live in a single flat collection: `notifications/{id}` with a
// `userId` field. We do NOT use a user-scoped subcollection — the previous
// shape (`notifications/{uid}/{id}`) was an invalid Firestore path and silently
// broke every write.

export type NotificationType =
  // Common-user inbound (things students get notified about)
  | 'like'
  | 'comment'
  | 'follow'
  | 'story'
  | 'post'
  | 'reminder'
  | 'system'
  | 'welcome'
  | 'exam'
  // Institution-inbound (things institutions get notified about)
  | 'follower_milestone' // hit a round number of followers (10, 100, 1k…)
  | 'post_engagement' // a published post crossed a likes/shares threshold
  | 'story_view_milestone' // a story crossed a view threshold

export type AppNotification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  uniId?: string
  postId?: string
  read: boolean
  createdAt: Date
}

type RawNotification = Omit<AppNotification, 'createdAt'> & {
  createdAt: Timestamp | Date | null
}

function normalise(id: string, raw: RawNotification): AppNotification {
  const ts = raw.createdAt as Timestamp | Date | null
  const createdAt =
    ts && typeof (ts as Timestamp).toDate === 'function'
      ? (ts as Timestamp).toDate()
      : ts instanceof Date
        ? ts
        : new Date()
  return {
    id,
    userId: raw.userId,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    uniId: raw.uniId,
    postId: raw.postId,
    read: !!raw.read,
    createdAt,
  }
}

export async function fetchNotifications(
  uid: string
): Promise<AppNotification[]> {
  if (!uid) return []
  const q = query(
    collection(db, getPath(...firestorePaths.notifications())),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  if (snap.empty) return []
  return snap.docs.map(d => normalise(d.id, d.data() as RawNotification))
}

export async function fetchUnreadCount(uid: string): Promise<number> {
  if (!uid) return 0
  const q = query(
    collection(db, getPath(...firestorePaths.notifications())),
    where('userId', '==', uid),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  return snap.size
}

export async function markAsRead(notificationId: string): Promise<void> {
  if (!notificationId) return
  const path = firestorePaths.notification(notificationId)
  await updateDoc(doc(db, getPath(...path)), { read: true })
}

export async function markAllAsRead(uid: string): Promise<void> {
  if (!uid) return
  const q = query(
    collection(db, getPath(...firestorePaths.notifications())),
    where('userId', '==', uid),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  if (snap.empty) return
  // Batched write — much faster than N round-trips and atomic if some docs
  // were just toggled in another tab.
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { read: true }))
  await batch.commit()
}

export async function deleteNotification(notificationId: string): Promise<void> {
  if (!notificationId) return
  const path = firestorePaths.notification(notificationId)
  await deleteDoc(doc(db, getPath(...path)))
}

export async function deleteAllRead(uid: string): Promise<void> {
  if (!uid) return
  const q = query(
    collection(db, getPath(...firestorePaths.notifications())),
    where('userId', '==', uid),
    where('read', '==', true)
  )
  const snap = await getDocs(q)
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
}

export type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  body: string
  uniId?: string
  postId?: string
  // Optional dedupe key. If supplied, the notification is created with this
  // exact id, so retries / idempotent triggers (e.g. "exam reminder for exam
  // X on date Y") don't duplicate. If omitted, Firestore auto-generates one.
  dedupeKey?: string
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<string> {
  const { userId, type, title, body, uniId, postId, dedupeKey } = input
  if (!userId || !title || !body) return ''

  const ref = dedupeKey
    ? doc(db, getPath(...firestorePaths.notification(dedupeKey)))
    : doc(collection(db, getPath(...firestorePaths.notifications())))

  await setDoc(
    ref,
    {
      userId,
      type,
      title,
      body,
      uniId: uniId || null,
      postId: postId || null,
      read: false,
      createdAt: serverTimestamp(),
    },
    { merge: false }
  )
  return ref.id
}
