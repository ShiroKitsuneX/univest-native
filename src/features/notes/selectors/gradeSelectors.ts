// Pure selectors / derivations for the notes domain.
// No React, no stores — every function takes its inputs and returns a
// fresh value. This makes them trivial to unit-test and reusable across
// NotasScreen and any future analytics surface.

import type { Grade } from '@/stores/profileStore'

export type TypeFilter = 'all' | 'prova' | 'simulado'
export type PeriodFilter = 'month' | 'year' | 'all'
export type SubjectKey = 'all' | 'l' | 'h' | 'n' | 'm' | 'r'

const DAY_MS = 86_400_000

// Average of the four ENEM areas (excluding redação, which is on a 0-1000
// scale and would skew the average if mixed in here). Matches the value
// that's been displayed as "média" since v1.
export function gradeAverage(g: Pick<Grade, 's'>): number {
  const { l, h, n, m } = g.s
  return Math.round((l + h + n + m) / 4)
}

// Parse `Grade.dt` strings — they come in either `DD/MM/YYYY` or
// `YYYY-MM-DD` shape depending on input source. Returns 0 if unparseable
// so out-of-range entries are filtered out by period guards.
export function gradeTimestamp(dt: string | undefined): number {
  if (!dt) return 0
  if (/^\d{4}-\d{2}-\d{2}/.test(dt)) {
    const t = Date.parse(dt)
    return Number.isNaN(t) ? 0 : t
  }
  const m = dt.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return 0
  const [, dd, mm, yyyy] = m
  return Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd))
}

// Filters a grade list by `prova`/`simulado`/`all`. Idempotent — same
// input always yields a same-shape array.
export function filterByType(grades: Grade[], type: TypeFilter): Grade[] {
  if (type === 'all') return grades
  return grades.filter(g => g.type === type)
}

// Period slice: "month" = last 30 days, "year" = last 365 days,
// "all" = no slice. Used to limit the chart window.
export function filterByPeriod(
  grades: Grade[],
  period: PeriodFilter,
  now: number = Date.now()
): Grade[] {
  if (period === 'all') return grades
  const days = period === 'month' ? 30 : 365
  const cutoff = now - days * DAY_MS
  return grades.filter(g => gradeTimestamp(g.dt) >= cutoff)
}

// Type counts driven by the *unfiltered* list — used as truthful
// labels on the dashboard tabs ("Provas (3)", "Simulados (5)").
export function countsByType(grades: Grade[]): {
  total: number
  provas: number
  simulados: number
} {
  let provas = 0
  let simulados = 0
  for (const g of grades) {
    if (g.type === 'prova') provas += 1
    else if (g.type === 'simulado') simulados += 1
  }
  return { total: grades.length, provas, simulados }
}

// Latest two grades' average delta. Null when there's fewer than 2 entries
// or when the avg can't be computed.
export function latestDelta(grades: Grade[]): number | null {
  if (grades.length < 2) return null
  const last = grades[grades.length - 1]
  const prev = grades[grades.length - 2]
  return gradeAverage(last) - gradeAverage(prev)
}

// Returns the per-subject score array for the most recent grade, or [] if
// no grades. Used by the radar/weak-subject UI.
export type SubjectScore = { subject: string; key: SubjectKey; v: number }
// `subjects[].k` is typed loosely as `string` here because the seed data
// in `src/data/subjects.js` uses string literals — the selector validates
// against `SubjectKey` internally and casts at the boundary.
export function lastGradeSubjectScores(
  grades: Grade[],
  subjects: ReadonlyArray<{ k: string; short: string }>
): SubjectScore[] {
  const last = grades[grades.length - 1]
  if (!last) return []
  return subjects.map(sub => {
    const key = sub.k as SubjectKey
    return {
      subject: sub.short,
      key,
      v: subjectScoreValue(last.s, key),
    }
  })
}

// Picks a subject's raw value out of a grade. `all` means average — used
// by the chart when a single-subject filter isn't selected.
export function subjectScoreValue(
  s: Grade['s'],
  key: SubjectKey
): number {
  if (key === 'all') return Math.round((s.l + s.h + s.n + s.m) / 4)
  return s[key] ?? 0
}

// Weakest subject from a `SubjectScore[]`. Null when the list is empty.
export function weakestSubject(scores: SubjectScore[]): SubjectScore | null {
  if (scores.length === 0) return null
  return scores.reduce((a, b) => (a.v < b.v ? a : b))
}
