import {
  listPostsByInstitution,
  type InstitutionPost,
} from '@/features/institution/repositories/institutionPostsRepository'
import { listStoriesForUni } from '@/features/feed/repositories/storiesRepository'
import { useUniversitiesStore } from '@/stores/universitiesStore'
import { logger } from '@/core/logging/logger'

export type RankedPost = InstitutionPost & { engagement: number }

export type InstitutionAnalytics = {
  followersCount: number
  postsCount: number
  totalLikes: number
  totalShares: number
  totalStoryViews: number
  activeStoriesCount: number
  // Recent activity — sum of likes + shares from posts published in the
  // last 30 days. Useful for "are people engaging with what we're posting
  // *now*" without needing time-series storage.
  last30DaysEngagement: number
  // Compatibility with existing callers (admin profile summary card).
  topPostTitle: string | null
  topPostEngagement: number
  // Top-N posts ranked by engagement (likes + shares). Drives the
  // dedicated Análises tab.
  topPosts: RankedPost[]
  averageEngagementPerPost: number
}

const ZERO: InstitutionAnalytics = {
  followersCount: 0,
  postsCount: 0,
  totalLikes: 0,
  totalShares: 0,
  totalStoryViews: 0,
  activeStoriesCount: 0,
  last30DaysEngagement: 0,
  topPostTitle: null,
  topPostEngagement: 0,
  topPosts: [],
  averageEngagementPerPost: 0,
}

const TOP_POSTS_LIMIT = 5

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// Aggregates institution-facing metrics in one shot. All reads go through
// the existing repositories (no new Firestore queries beyond `fetchUniversity`)
// so this stays a pure orchestration function — safe to call on screen
// mount and on pull-to-refresh.
export async function loadInstitutionAnalytics(
  uniId: string
): Promise<InstitutionAnalytics> {
  if (!uniId) return ZERO
  try {
    const [posts, stories] = await Promise.all([
      listPostsByInstitution(uniId),
      listStoriesForUni(uniId),
    ])
    const uni = useUniversitiesStore
      .getState()
      .unis.find(u => String(u.id) === String(uniId))

    const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0)
    const totalShares = posts.reduce((sum, p) => sum + (p.sharesCount || 0), 0)

    const cutoff = Date.now() - THIRTY_DAYS_MS
    const last30DaysEngagement = posts
      .filter(p => p.createdAt && p.createdAt.getTime() >= cutoff)
      .reduce(
        (sum, p) => sum + (p.likesCount || 0) + (p.sharesCount || 0),
        0
      )

    const ranked: RankedPost[] = posts
      .map(p => ({
        ...p,
        engagement: (p.likesCount || 0) + (p.sharesCount || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement)

    const topPosts = ranked.slice(0, TOP_POSTS_LIMIT)
    const topPost = ranked[0] ?? null
    const topEngagement = topPost?.engagement ?? 0
    const averageEngagementPerPost =
      posts.length > 0
        ? Math.round((totalLikes + totalShares) / posts.length)
        : 0

    const now = Date.now()
    const activeStoriesCount = stories.filter(s => {
      const exp = s.expiresAt ? new Date(s.expiresAt).getTime() : 0
      return exp > now
    }).length
    const totalStoryViews = stories.reduce(
      (sum, s) => sum + (s.viewsCount || 0),
      0
    )

    const u = uni as unknown as
      | { followersCount?: number; followers?: number | string }
      | undefined
    const followersCount = Number(u?.followersCount ?? u?.followers ?? 0) || 0

    return {
      followersCount,
      postsCount: posts.length,
      totalLikes,
      totalShares,
      totalStoryViews,
      activeStoriesCount,
      last30DaysEngagement,
      topPostTitle: topPost?.title ?? null,
      topPostEngagement: topEngagement,
      topPosts,
      averageEngagementPerPost,
    }
  } catch (err) {
    logger.warn('loadInstitutionAnalytics:', (err as Error)?.message)
    return ZERO
  }
}
