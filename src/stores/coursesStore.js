import { create } from 'zustand'
import { ALL_COURSES } from '@/data/areas'
import { fetchCourses, fetchIcons } from '@/services/firestore'

export const useCoursesStore = create((set, get) => ({
  fbCourses: [],
  fbIcons: {},
  loaded: false,

  load: async () => {
    if (get().loaded) return
    try {
      const [courses, icons] = await Promise.all([fetchCourses(), fetchIcons()])
      set({
        fbCourses: courses,
        fbIcons: icons,
        loaded: true,
      })
    } catch {
      set({ loaded: true })
    }
  },

  getCourses: () => {
    const { fbCourses } = get()
    return fbCourses.length ? fbCourses : ALL_COURSES
  },

  getIcon: (id, fallback) => {
    const { fbIcons } = get()
    return fbIcons[id] || fallback
  },
}))
