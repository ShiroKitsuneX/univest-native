import { create } from "zustand";
import { persistToUser } from "./middleware/persistToUser";

export const useProgressStore = create(persistToUser((set, get, api) => ({
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

  hydrate: (d) => {
    api.__suspendPersist();
    try {
      set((state) => {
        const next = {};
        if (d.readBooks) next.readBooks = d.readBooks;
        if (d.readingBooks) next.readingBooks = d.readingBooks;
        if (d.completedTodos) next.completedTodos = d.completedTodos;
        return { ...state, ...next };
      });
    } finally { api.__resumePersist(); }
  },
}), { keys: ["readBooks", "readingBooks", "completedTodos"] }));
