import { AREAS } from "./areas";

export const ALL_COURSES = [...new Set(AREAS.flatMap(a => a.courses))].sort();