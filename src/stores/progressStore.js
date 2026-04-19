import { create } from "zustand";

export const useProgressStore = create((set) => ({
  readBooks: {},
  readingBooks: [],
  completedTodos: {},

  setReadBooks: (v) => set(state => ({
    readBooks: typeof v === "function" ? v(state.readBooks) : v,
  })),
  setReadingBooks: (v) => set(state => ({
    readingBooks: typeof v === "function" ? v(state.readingBooks) : v,
  })),
  setCompletedTodos: (v) => set(state => ({
    completedTodos: typeof v === "function" ? v(state.completedTodos) : v,
  })),

  updateBookStatus: (bookKey, status) => set(state => {
    const next = { ...state.readBooks };
    if (status === "reading") next[bookKey] = "reading";
    else if (status === "read") next[bookKey] = "read";
    else if (status === "none") delete next[bookKey];
    return { readBooks: next };
  }),
}));
