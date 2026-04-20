import { create } from "zustand";
import { STORIES } from "../data/stories";

export const useStoriesStore = create((set, get) => ({
  stories: [],
  viewedIds: {},
  loading: false,

  setStories: (stories) => set({ stories }),
  
  setViewedIds: (ids) => set({ viewedIds: ids }),
  
  setLoading: (loading) => set({ loading }),

  isViewed: (storyId) => {
    const { viewedIds } = get();
    return !!viewedIds[storyId];
  },

  markViewed: (storyId) => {
    set(state => ({
      viewedIds: { ...state.viewedIds, [storyId]: Date.now() }
    }));
  },

  markMultipleViewed: (storyIds) => {
    const now = Date.now();
    const updates = {};
    storyIds.forEach(id => { updates[id] = now; });
    set(state => ({ viewedIds: { ...state.viewedIds, ...updates } }));
  },

  load: async () => {
    set({ loading: true });
    try {
      const { STORIES } = await import("../data/stories");
      const now = new Date();
      const activeStories = STORIES.filter(s => new Date(s.expiresAt) > now);
      set({ stories: activeStories });
    } catch (e) {
      console.log("Error loading stories:", e);
    } finally {
      set({ loading: false });
    }
  },

  getStoriesByUni: (uniId) => {
    const { stories } = get();
    return stories.filter(s => s.uniId === uniId);
  },

  getGroupedStories: () => {
    const { stories } = get();
    const grouped = {};
    stories.forEach(story => {
      if (!grouped[story.uniId]) {
        grouped[story.uniId] = {
          uniId: story.uniId,
          uniName: story.uniName,
          uniColor: story.uniColor,
          stories: [],
          latestTimestamp: 0,
        };
      }
      grouped[story.uniId].stories.push(story);
      const ts = new Date(story.createdAt).getTime();
      if (ts > grouped[story.uniId].latestTimestamp) {
        grouped[story.uniId].latestTimestamp = ts;
      }
    });
    return Object.values(grouped).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  },
}));
