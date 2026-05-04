import { describe, expect, it } from '@jest/globals'
import {
  buildGoalTasks,
  countCompleted,
  daysUntilNextExam,
  summariseGoal,
} from '@/features/planning/selectors/goalTasks'
import type { University } from '@/stores/universitiesStore'

const goal = (overrides: Partial<University> = {}): University => ({
  id: 'usp',
  name: 'USP',
  fullName: 'Universidade de São Paulo',
  state: 'SP',
  ...overrides,
})

describe('daysUntilNextExam', () => {
  it('returns null when no upcoming exam', () => {
    expect(daysUntilNextExam(goal())).toBeNull()
  })

  it('returns null when the date is unparseable', () => {
    expect(
      daysUntilNextExam(
        goal({ exams: [{ status: 'upcoming', date: 'lol' }] })
      )
    ).toBeNull()
  })

  it('returns the day count for an upcoming exam', () => {
    const now = Date.UTC(2025, 5, 15)
    const examDate = new Date(now + 7 * 86400000).toISOString()
    expect(
      daysUntilNextExam(
        goal({ exams: [{ status: 'upcoming', date: examDate }] }),
        now
      )
    ).toBe(7)
  })

  it('floors at 0 for past exams (defensive)', () => {
    const now = Date.UTC(2025, 5, 15)
    const examDate = new Date(now - 86400000).toISOString()
    expect(
      daysUntilNextExam(
        goal({ exams: [{ status: 'upcoming', date: examDate }] }),
        now
      )
    ).toBe(0)
  })
})

describe('buildGoalTasks', () => {
  it('always emits the two admin tasks', () => {
    const tasks = buildGoalTasks(goal())
    expect(tasks).toHaveLength(2)
    expect(tasks[0]).toMatchObject({
      id: 'usp-inscricao',
      type: 'inscricao',
    })
    expect(tasks[1]).toMatchObject({
      id: 'usp-taxa',
      type: 'taxa',
    })
  })

  it('emits one task per book + the two admin tasks', () => {
    const tasks = buildGoalTasks(
      goal({ books: ['Dom Casmurro - Machado', 'Vidas Secas - Graciliano'] })
    )
    expect(tasks).toHaveLength(4)
    expect(tasks[0]).toMatchObject({
      id: 'usp-Dom Casmurro - Machado',
      bookKey: 'usp-Dom Casmurro - Machado',
      text: 'Ler "Dom Casmurro"',
      type: 'book',
    })
  })

  it('strips the " - author" suffix in the title', () => {
    const [bookTask] = buildGoalTasks(
      goal({ books: ['Iracema - José de Alencar'] })
    )
    expect(bookTask.text).toBe('Ler "Iracema"')
  })
})

describe('countCompleted', () => {
  const tasks = buildGoalTasks(
    goal({ books: ['Capitães da Areia - Jorge Amado'] })
  )

  it('counts a book as complete only when readBooks marks "read"', () => {
    expect(
      countCompleted(
        tasks,
        { 'usp-Capitães da Areia - Jorge Amado': 'reading' },
        {}
      )
    ).toBe(0)
    expect(
      countCompleted(
        tasks,
        { 'usp-Capitães da Areia - Jorge Amado': 'read' },
        {}
      )
    ).toBe(1)
  })

  it('counts admin tasks via completedTodos', () => {
    expect(countCompleted(tasks, {}, { 'usp-inscricao': true })).toBe(1)
    expect(
      countCompleted(tasks, {}, {
        'usp-inscricao': true,
        'usp-taxa': true,
      })
    ).toBe(2)
  })
})

describe('summariseGoal', () => {
  it('rolls up tasks + completion + percent', () => {
    const summary = summariseGoal(
      goal({ books: ['A - x', 'B - y'] }),
      { 'usp-A - x': 'read' },
      { 'usp-inscricao': true }
    )
    expect(summary.total).toBe(4)
    expect(summary.completed).toBe(2)
    expect(summary.percent).toBe(50)
  })

  it('returns 0% with no tasks', () => {
    // No books, but admin tasks always exist — total is always >= 2.
    const summary = summariseGoal(goal(), {}, {})
    expect(summary.total).toBe(2)
    expect(summary.completed).toBe(0)
    expect(summary.percent).toBe(0)
  })
})
