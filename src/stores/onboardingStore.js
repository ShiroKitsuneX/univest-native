import { create } from "zustand";
import { USER_TYPES } from "../data/userTypes";

export const useOnboardingStore = create((set) => ({
  step: 0,
  done: false,
  uType: null,
  c1: "",
  c2: "",

  setStep: (step) => set(state => ({
    step: typeof step === "function" ? step(state.step) : step,
  })),
  setDone: (done) => set({ done }),
  setUType: (uType) => set({ uType }),
  setC1: (c1) => set({ c1 }),
  setC2: (c2) => set({ c2 }),

  hydrateFromUTypeId: (uTypeId) => {
    const ut = uTypeId ? USER_TYPES.find(t => t.id === uTypeId) || null : null;
    set({ uType: ut });
  },
}));
