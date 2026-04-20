import { create } from "zustand";
import { FEED } from "../data/feed";
import { fetchPosts, fetchPostLikes } from "../services/firestore";
import { persistToUser } from "./middleware/persistToUser";

export const usePostsStore = create(persistToUser((set, get, api) => ({
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

  setLiked: (v) => set(state => ({
    liked: typeof v === "function" ? v(state.liked) : v,
  })),
  setSaved: (v) => set(state => ({
    saved: typeof v === "function" ? v(state.saved) : v,
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

  hydrate: (d) => {
    api.__suspendPersist();
    try {
      set((state) => {
        const next = {};
        if (d.saved) next.saved = d.saved;
        if (d.liked) next.liked = d.liked;
        return { ...state, ...next };
      });
    } finally { api.__resumePersist(); }
  },
}), { keys: ["saved"] }));
