// Writers for institution-inbound notifications. Each helper is idempotent
// via a `dedupeKey` so the same milestone never produces two notifications,
// no matter how many times the call site fires (race conditions on follow
// taps, multiple admins on the same university, etc).
//
// These are intentionally client-side and best-effort. When we move counters
// server-side (see docs/COUNTERS.md "Future direction"), this logic should
// move to a Cloud Function trigger. Until then, callers wrap each helper in
// `.catch(() => {})` so a failed notification never blocks the underlying
// social action.

import {
  createNotification,
  type NotificationType,
} from '@/features/feed/repositories/notificationsRepository'
import { logger } from '@/core/logging/logger'

const FOLLOWER_MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000]
const POST_ENGAGEMENT_MILESTONES = [10, 50, 100, 500, 1000]
const STORY_VIEW_MILESTONES = [50, 250, 1000, 5000]

// Returns the milestone the given count just hit (newCount crossed from
// below to >=) or null. Crossings only count if `previousCount < milestone`.
function justCrossed(
  previousCount: number,
  newCount: number,
  thresholds: readonly number[]
): number | null {
  for (const t of thresholds) {
    if (previousCount < t && newCount >= t) return t
  }
  return null
}

// `recipientUid` is the institution-account uid that owns the linked uni.
// We currently don't store the inverse mapping (uniId -> ownerUid) in
// `usuarios`, so the caller must resolve it (e.g. via `getOwnerUidForUni`
// on the auth side once that's added). If you don't have it yet, skip the
// helper — it returns early when `recipientUid` is empty.
type Common = {
  recipientUid: string
  uniId: string
}

export async function notifyFollowerMilestone({
  recipientUid,
  uniId,
  previousFollowers,
  newFollowers,
  uniName,
}: Common & {
  previousFollowers: number
  newFollowers: number
  uniName: string
}): Promise<void> {
  if (!recipientUid) return
  const crossed = justCrossed(
    previousFollowers,
    newFollowers,
    FOLLOWER_MILESTONES
  )
  if (!crossed) return
  try {
    await createNotification({
      userId: recipientUid,
      type: 'follower_milestone' satisfies NotificationType,
      title: `🏆 ${crossed.toLocaleString('pt-BR')} seguidores!`,
      body: `${uniName} acabou de atingir ${crossed.toLocaleString('pt-BR')} seguidores. Continue publicando para crescer ainda mais.`,
      uniId,
      dedupeKey: `milestone-followers-${uniId}-${crossed}`,
    })
  } catch (err) {
    logger.warn(
      'notifyFollowerMilestone:',
      (err as Error)?.message
    )
  }
}

export async function notifyPostEngagementMilestone({
  recipientUid,
  uniId,
  postId,
  postTitle,
  previousEngagement,
  newEngagement,
}: Common & {
  postId: string
  postTitle: string
  previousEngagement: number
  newEngagement: number
}): Promise<void> {
  if (!recipientUid || !postId) return
  const crossed = justCrossed(
    previousEngagement,
    newEngagement,
    POST_ENGAGEMENT_MILESTONES
  )
  if (!crossed) return
  try {
    await createNotification({
      userId: recipientUid,
      type: 'post_engagement' satisfies NotificationType,
      title: `📈 ${crossed} interações no seu post`,
      body: `"${postTitle.slice(0, 80)}" acabou de atingir ${crossed} curtidas + compartilhamentos.`,
      uniId,
      postId,
      dedupeKey: `milestone-post-${postId}-${crossed}`,
    })
  } catch (err) {
    logger.warn(
      'notifyPostEngagementMilestone:',
      (err as Error)?.message
    )
  }
}

export async function notifyStoryViewMilestone({
  recipientUid,
  uniId,
  storyId,
  previousViews,
  newViews,
}: Common & {
  storyId: string
  previousViews: number
  newViews: number
}): Promise<void> {
  if (!recipientUid || !storyId) return
  const crossed = justCrossed(previousViews, newViews, STORY_VIEW_MILESTONES)
  if (!crossed) return
  try {
    await createNotification({
      userId: recipientUid,
      type: 'story_view_milestone' satisfies NotificationType,
      title: `👀 ${crossed} visualizações na sua story`,
      body: `Uma das suas stories acabou de cruzar ${crossed} visualizações.`,
      uniId,
      dedupeKey: `milestone-story-${storyId}-${crossed}`,
    })
  } catch (err) {
    logger.warn(
      'notifyStoryViewMilestone:',
      (err as Error)?.message
    )
  }
}
