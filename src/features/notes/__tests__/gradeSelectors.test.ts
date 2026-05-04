import { describe, expect, it } from '@jest/globals'
import {
  countsByType,
  filterByPeriod,
  filterByType,
  gradeAverage,
  gradeTimestamp,
  lastGradeSubjectScores,
  latestDelta,
  subjectScoreValue,
  weakestSubject,
} from '@/features/notes/selectors/gradeSelectors'
import type { Grade } from '@/stores/profileStore'

const mk = (
  partial: Partial<Grade> & { s?: Partial<Grade['s']> } = {}
): Grade => ({
  id: 1,
  ex: 'ENEM',
  dt: '01/01/2025',
  type: 'prova',
  ...partial,
  s: {
    l: 60,
    h: 60,
    n: 60,
    m: 60,
    r: 600,
    ...(partial.s ?? {}),
  },
})

describe('gradeAverage', () => {
  it('averages the four ENEM areas, ignoring redação', () => {
    expect(gradeAverage(mk({ s: { l: 80, h: 70, n: 60, m: 50, r: 1000 } })))
      .toBe(65)
  })
})

describe('gradeTimestamp', () => {
  it('parses DD/MM/YYYY', () => {
    expect(gradeTimestamp('15/03/2025')).toBe(Date.UTC(2025, 2, 15))
  })

  it('parses YYYY-MM-DD', () => {
    expect(gradeTimestamp('2025-03-15')).toBeGreaterThan(0)
  })

  it('returns 0 for unparseable input', () => {
    expect(gradeTimestamp(undefined)).toBe(0)
    expect(gradeTimestamp('lol')).toBe(0)
    expect(gradeTimestamp('')).toBe(0)
  })
})

describe('filterByType', () => {
  const grades = [
    mk({ id: 1, type: 'prova' }),
    mk({ id: 2, type: 'simulado' }),
    mk({ id: 3, type: 'prova' }),
  ]

  it('returns the same array for "all"', () => {
    expect(filterByType(grades, 'all')).toEqual(grades)
  })

  it('keeps only the matching type', () => {
    expect(filterByType(grades, 'prova').map(g => g.id)).toEqual([1, 3])
    expect(filterByType(grades, 'simulado').map(g => g.id)).toEqual([2])
  })
})

describe('filterByPeriod', () => {
  const now = Date.UTC(2025, 5, 15)
  const grades = [
    mk({ id: 1, dt: '01/01/2025' }),
    mk({ id: 2, dt: '01/06/2025' }),
    mk({ id: 3, dt: '14/06/2025' }),
  ]

  it('returns all grades for "all"', () => {
    expect(filterByPeriod(grades, 'all', now)).toEqual(grades)
  })

  it('keeps only entries within the last 30 days', () => {
    const result = filterByPeriod(grades, 'month', now).map(g => g.id)
    expect(result).toEqual([2, 3])
  })

  it('keeps only entries within the last 365 days', () => {
    expect(filterByPeriod(grades, 'year', now).map(g => g.id)).toEqual([
      1, 2, 3,
    ])
  })
})

describe('countsByType', () => {
  it('counts provas, simulados, and total honestly', () => {
    const grades = [
      mk({ id: 1, type: 'prova' }),
      mk({ id: 2, type: 'simulado' }),
      mk({ id: 3, type: 'prova' }),
      mk({ id: 4, type: 'simulado' }),
    ]
    expect(countsByType(grades)).toEqual({
      total: 4,
      provas: 2,
      simulados: 2,
    })
  })

  it('handles empty input', () => {
    expect(countsByType([])).toEqual({ total: 0, provas: 0, simulados: 0 })
  })
})

describe('latestDelta', () => {
  it('returns null when fewer than 2 entries', () => {
    expect(latestDelta([])).toBeNull()
    expect(latestDelta([mk()])).toBeNull()
  })

  it('returns the difference between the last two averages', () => {
    const grades = [
      mk({ id: 1, s: { l: 50, h: 50, n: 50, m: 50, r: 500 } }),
      mk({ id: 2, s: { l: 60, h: 60, n: 60, m: 60, r: 600 } }),
    ]
    expect(latestDelta(grades)).toBe(10)
  })
})

describe('subjectScoreValue', () => {
  const s = { l: 70, h: 80, n: 60, m: 50, r: 800 }

  it('returns the raw subject for known keys', () => {
    expect(subjectScoreValue(s, 'l')).toBe(70)
    expect(subjectScoreValue(s, 'h')).toBe(80)
    expect(subjectScoreValue(s, 'r')).toBe(800)
  })

  it('returns the 4-area average for "all"', () => {
    expect(subjectScoreValue(s, 'all')).toBe(65)
  })
})

describe('lastGradeSubjectScores + weakestSubject', () => {
  const subjects = [
    { k: 'l', short: 'LIN' },
    { k: 'h', short: 'HUM' },
    { k: 'n', short: 'NAT' },
    { k: 'm', short: 'MAT' },
  ] as const

  it('returns [] when no grades', () => {
    expect(lastGradeSubjectScores([], subjects)).toEqual([])
    expect(weakestSubject([])).toBeNull()
  })

  it('finds the weakest subject in the last grade', () => {
    const grades = [mk({ s: { l: 70, h: 80, n: 40, m: 60, r: 600 } })]
    const scores = lastGradeSubjectScores(grades, subjects)
    expect(scores.map(s => s.v)).toEqual([70, 80, 40, 60])
    expect(weakestSubject(scores)?.subject).toBe('NAT')
  })
})
