import { create } from 'zustand'
import { FEED } from '@/data/feed'
import { fetchPosts, fetchPostLikes } from '@/services/firestore'
import { persistToUser } from '@/stores/middleware/persistToUser'

export type Post = {
  id: string | number
  likesCount?: number
  likes?: number
  sharesCount?: number
  [key: string]: unknown
}

type PostsState = {
  posts: Post[]
  liked: Record<string, boolean>
  saved: Record<string, boolean>
  loaded: boolean

  load: () => Promise<Post[]>
  loadLikesFor: (uid: string) => Promise<Record<string, boolean>>
  setLiked: (
    v:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void
  setSaved: (
    v:
      | Record<string, boolean>
      | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void
  setLikeDelta: (id: Post['id'], delta: number) => void
  setShareDelta: (id: Post['id'], delta: number) => void
  hydrate: (d: { saved?: Record<string, boolean>; liked?: Record<string, boolean> }) => void
}

export const usePostsStore = create<PostsState>(
  persistToUser<PostsState>(
    (set, get, api) => ({
      posts: [],
      liked: {},
      saved: {},
      loaded: false,

      load: async () => {
        try {
          const f = (await fetchPosts()) as Post[]
          if (f.length) {
            set({ posts: f, loaded: true })
            return f
          }
          set({ posts: FEED as Post[], loaded: true })
          return FEED as Post[]
        } catch {
          set({ posts: FEED as Post[], loaded: true })
          return FEED as Post[]
        }
      },

      loadLikesFor: async uid => {
        const { posts } = get()
        if (!uid || !posts.length) return {}
        try {
          const lk = (await fetchPostLikes(posts, uid)) as Record<
            string,
            boolean
          >
          if (Object.keys(lk).length) set({ liked: lk })
          return lk
        } catch {
          return {}
        }
      },

      setLiked: v =>
        set(state => ({
          liked: typeof v === 'function' ? v(state.liked) : v,
        })),
      setSaved: v =>
        set(state => ({
          saved: typeof v === 'function' ? v(state.saved) : v,
        })),

      setLikeDelta: (id, delta) =>
        set(state => ({
          posts: state.posts.map(p =>
            p.id === id
              ? { ...p, likesCount: (p.likesCount ?? p.likes ?? 0) + delta }
              : p
          ),
        })),

      setShareDelta: (id, delta) =>
        set(state => ({
          posts: state.posts.map(p =>
            p.id === id
              ? { ...p, sharesCount: (p.sharesCount || 0) + delta }
              : p
          ),
        })),

      hydrate: d => {
        ;(api as any).__suspendPersist()
        try {
          set(state => {
            const next: Partial<PostsState> = {}
            if (d.saved) next.saved = d.saved
            if (d.liked) next.liked = d.liked
            return { ...state, ...next }
          })
        } finally {
          ;(api as any).__resumePersist()
        }
      },
    }),
    { keys: ['saved'] }
  )
)
