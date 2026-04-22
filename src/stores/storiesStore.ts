import { create } from 'zustand'
import { useUniversitiesStore } from './universitiesStore'
import {
  loadStoriesForUser,
  trackStoryView,
  type StoryDoc,
} from '@/features/feed/services/storiesService'

export type Story = {
  id: string
  uniId: string
  uniName: string
  uniColor: string
  imageUrl: string
  createdAt: string
  expiresAt: string
  viewsCount: number
}

export type GroupedStories = {
  uniId: string
  uniName: string
  uniColor: string
  stories: Story[]
  latestTimestamp: number
}

type StoriesState = {
  stories: Story[]
  viewedIds: Record<string, number>
  loading: boolean

  setStories: (stories: Story[]) => void
  setViewedIds: (ids: Record<string, number>) => void
  setLoading: (loading: boolean) => void
  isViewed: (storyId: string) => boolean
  markViewed: (storyId: string) => void
  markMultipleViewed: (storyIds: string[]) => void
  load: () => Promise<void>
  getStoriesByUni: (uniId: string) => Story[]
  getGroupedStories: () => GroupedStories[]
}

export const useStoriesStore = create<StoriesState>((set, get) => ({
  stories: [],
  viewedIds: {},
  loading: false,

  setStories: stories => set({ stories }),
  setViewedIds: ids => set({ viewedIds: ids }),
  setLoading: loading => set({ loading }),

  isViewed: storyId => {
    const { viewedIds } = get()
    return !!viewedIds[storyId]
  },

  markViewed: storyId => {
    const { stories } = get()
    const story = stories.find(s => s.id === storyId)
    if (story) {
      trackStoryView(story.uniId, storyId).catch(() => {})
    }
    set(state => ({
      viewedIds: { ...state.viewedIds, [storyId]: Date.now() },
    }))
  },

  markMultipleViewed: storyIds => {
    const now = Date.now()
    const updates: Record<string, number> = {}
    storyIds.forEach(id => {
      updates[id] = now
    })
    set(state => ({ viewedIds: { ...state.viewedIds, ...updates } }))
  },

  load: async () => {
    set({ loading: true })
    try {
      const getFollowedUnis = useUniversitiesStore.getState().getFollowedUnis
      const followedUnis = getFollowedUnis()
      const followedUniIds = followedUnis.map(u => String(u.id))
      const fbStories = await loadStoriesForUser(followedUniIds)
      set({ stories: fbStories })
    } catch {
      set({ stories: [] })
    } finally {
      set({ loading: false })
    }
  },

  getStoriesByUni: uniId => {
    const { stories } = get()
    return stories.filter(s => s.uniId === uniId)
  },

  getGroupedStories: () => {
    const { stories } = get()
    const grouped: Record<string, GroupedStories> = {}
    stories.forEach(story => {
      if (!grouped[story.uniId]) {
        grouped[story.uniId] = {
          uniId: story.uniId,
          uniName: story.uniName,
          uniColor: story.uniColor,
          stories: [],
          latestTimestamp: 0,
        }
      }
      grouped[story.uniId].stories.push(story)
      const ts = new Date(story.createdAt).getTime()
      if (ts > grouped[story.uniId].latestTimestamp) {
        grouped[story.uniId].latestTimestamp = ts
      }
    })
    return Object.values(grouped).sort(
      (a, b) => b.latestTimestamp - a.latestTimestamp
    )
  },
}))
