import { create } from "zustand";

export const useProgressStore = create((set) => ({
  readBooks: {},
  readingBooks: [],
  completedTodos: {},

  setReadBooks: (readBooks) => set({ readBooks }),
  setReadingBooks: (readingBooks) => set({ readingBooks }),
  setCompletedTodos: (completedTodos) => set({ completedTodos }),

  updateBookStatus: (bookKey, status) => set(state => {
    const next = { ...state.readBooks };
    if (status === "reading") next[bookKey] = "reading";
    else if (status === "read") next[bookKey] = "read";
    else if (status === "none") delete next[bookKey];
    return { readBooks: next };
  }),
}));
