import { create } from "zustand";
import { UNIVERSITIES } from "../data/universities";
import { fetchUniversities } from "../services/firestore";

export const useUniversitiesStore = create((set, get) => ({
  unis: UNIVERSITIES,
  fbUnis: [],
  selUni: null,
  goalsUnis: [],
  uniPrefs: {},
  uniSort: "date",

  setUnis: (unis) => set(typeof unis === "function"
    ? state => ({ unis: unis(state.unis) })
    : { unis }),
  setFbUnis: (v) => set(state => ({
    fbUnis: typeof v === "function" ? v(state.fbUnis) : v,
  })),
  setSelUni: (selUni) => set(typeof selUni === "function"
    ? state => ({ selUni: selUni(state.selUni) })
    : { selUni }),
  setGoalsUnis: (v) => set(state => ({
    goalsUnis: typeof v === "function" ? v(state.goalsUnis) : v,
  })),
  setUniPrefs: (v) => set(state => ({
    uniPrefs: typeof v === "function" ? v(state.uniPrefs) : v,
  })),
  setUniSort: (uniSort) => set({ uniSort }),

  load: async () => {
    try {
      const unisList = await fetchUniversities();
      if (unisList.length) {
        const merged = unisList.map(fbU => {
          const localU = UNIVERSITIES.find(lU => lU.name === fbU.name);
          return localU ? { ...fbU, books: localU.books || [], exams: localU.exams || [] } : fbU;
        });
        set({ fbUnis: merged, unis: merged });
        return merged;
      }
      return [];
    } catch {
      return [];
    }
  },

  applyFollowedUnis: (followedUnis = []) => {
    const { fbUnis } = get();
    const source = fbUnis.length ? fbUnis : UNIVERSITIES;
    set({ unis: source.map(u => ({ ...u, followed: followedUnis.includes(u.name) || false })) });
  },
}));
