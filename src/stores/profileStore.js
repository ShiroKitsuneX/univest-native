import { create } from "zustand";
import { persistToUser } from "@/stores/middleware/persistToUser";

const INITIAL_GRADES = [
  { id: 1, ex: "FUVEST Simulado 1", dt: "Mar/2025", type: "simulado", s: { l: 62, h: 70, n: 58, m: 55, r: 680 } },
  { id: 2, ex: "FUVEST Simulado 2", dt: "Abr/2025", type: "simulado", s: { l: 68, h: 74, n: 65, m: 60, r: 720 } },
  { id: 3, ex: "ENEM Prova",         dt: "Mai/2025", type: "prova", s: { l: 72, h: 78, n: 69, m: 64, r: 760 } },
];

const INITIAL_NG = { ex: "", dt: "", l: "", h: "", n: "", m: "", r: "", type: "prova" };

const PERSIST_KEYS = [
  "theme", "av", "avBgIdx", "nome", "sobrenome", "gs",
  "countryId", "stateId", "cityId", "studyCountryId", "studyStateId", "studyCityId",
];

// Store uses `gs`; Firestore uses `grades`. Middleware writes the Firestore shape.
const serializeProfile = (s) => ({
  theme: s.theme, av: s.av, avBgIdx: s.avBgIdx,
  nome: s.nome, sobrenome: s.sobrenome, grades: s.gs,
  countryId: s.countryId, stateId: s.stateId, cityId: s.cityId,
  studyCountryId: s.studyCountryId, studyStateId: s.studyStateId, studyCityId: s.studyCityId,
});

export const useProfileStore = create(persistToUser((set, get, api) => ({
  nome: "",
  sobrenome: "",
  theme: "dark",
  av: "🧑‍🎓",
  avBgIdx: 0,
  gs: INITIAL_GRADES,
  ng: INITIAL_NG,

  countryId: "",
  stateId: "",
  cityId: "",
  studyCountryId: "",
  studyStateId: "",
  studyCityId: "",

  setNome: (nome) => set({ nome }),
  setSobrenome: (sobrenome) => set({ sobrenome }),
  setTheme: (theme) => set({ theme }),
  setAv: (av) => set({ av }),
  setAvBgIdx: (avBgIdx) => set({ avBgIdx }),
  setGs: (gs) => set(typeof gs === "function" ? state => ({ gs: gs(state.gs) }) : { gs }),
  setNg: (ng) => set(typeof ng === "function" ? state => ({ ng: ng(state.ng) }) : { ng }),

  setCountryId: (countryId) => set({ countryId }),
  setStateId: (stateId) => set({ stateId }),
  setCityId: (cityId) => set({ cityId }),
  setStudyCountryId: (studyCountryId) => set({ studyCountryId }),
  setStudyStateId: (studyStateId) => set({ studyStateId }),
  setStudyCityId: (studyCityId) => set({ studyCityId }),

  hydrate: (d) => {
    api.__suspendPersist();
    try {
      set((state) => {
        const next = {};
        if (d.theme) next.theme = d.theme;
        if (d.av) next.av = d.av;
        if (d.avBgIdx !== undefined) next.avBgIdx = d.avBgIdx;
        if (d.grades) next.gs = d.grades;
        if (d.nome) next.nome = d.nome;
        if (d.sobrenome) next.sobrenome = d.sobrenome;
        if (d.countryId) next.countryId = d.countryId;
        if (d.stateId) next.stateId = d.stateId;
        if (d.cityId) next.cityId = d.cityId;
        if (d.studyCountryId) next.studyCountryId = d.studyCountryId;
        if (d.studyStateId) next.studyStateId = d.studyStateId;
        if (d.studyCityId) next.studyCityId = d.studyCityId;
        return { ...state, ...next };
      });
    } finally {
      api.__resumePersist();
    }
  },
}), { keys: PERSIST_KEYS, serialize: serializeProfile }));
