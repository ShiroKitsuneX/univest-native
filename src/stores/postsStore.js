import { create } from "zustand";
import { FEED } from "../data/feed";
import { fetchPosts, fetchPostLikes } from "../services/firestore";

export const usePostsStore = create((set, get) => ({
  posts: [],
  liked: {},
  saved: {},
  loaded: false,

  load: async () => {
    try {
      const f = await fetchPosts();
      if (f.length) {
        set({ posts: f, loaded: true });
        return f;
      }
      set({ posts: FEED, loaded: true });
      return FEED;
    } catch {
      set({ posts: FEED, loaded: true });
      return FEED;
    }
  },

  loadLikesFor: async (uid) => {
    const { posts } = get();
    if (!uid || !posts.length) return {};
    try {
      const lk = await fetchPostLikes(posts, uid);
      if (Object.keys(lk).length) set({ liked: lk });
      return lk;
    } catch {
      return {};
    }
  },

  setLiked: (liked) => set({ liked }),
  setSaved: (saved) => set({ saved }),
  toggleSaved: (id) => set(state => ({
    saved: { ...state.saved, [id]: !state.saved[id] },
  })),
  setLikedOne: (id, value) => set(state => ({
    liked: { ...state.liked, [id]: value },
  })),

  setLikeDelta: (id, delta) => set(state => ({
    posts: state.posts.map(p => p.id === id
      ? { ...p, likesCount: (p.likesCount ?? p.likes ?? 0) + delta }
      : p),
  })),

  setShareDelta: (id, delta) => set(state => ({
    posts: state.posts.map(p => p.id === id
      ? { ...p, sharesCount: (p.sharesCount || 0) + delta }
      : p),
  })),
}));
