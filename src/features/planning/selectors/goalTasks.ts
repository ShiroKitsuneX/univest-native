// Pure selectors for the planning domain.
// Goal-uni → task list derivation, days-until-exam computation, completion
// progress. Currently inlined in PerfilScreen — extracted here so the
// product invariants ("which tasks does each goal have?") are testable and
// reused by any future surface (e.g. a dedicated Planning tab).

import type { University } from '@/stores/universitiesStore'

export type GoalTaskType = 'book' | 'inscricao' | 'taxa'

export type GoalTask = {
  id: string
  // Stable key used for the readBooks map (book tasks only — undefined
  // otherwise so call-sites have a single discriminator).
  bookKey?: string
  text: string
  type: GoalTaskType
}

const DAY_MS = 1000 * 60 * 60 * 24

// Days until the next 'upcoming' exam for a goal-uni. Returns null when
// the goal has no upcoming exam or the date is unparseable. Floors at 0
// so a same-day exam reads as 0 (not negative).
export function daysUntilNextExam(
  goal: University,
  now: number = Date.now()
): number | null {
  const nextExam = goal.exams?.find(e => e.status === 'upcoming')
  if (!nextExam?.date) return null
  const t = new Date(nextExam.date).getTime()
  if (Number.isNaN(t)) return null
  return Math.max(0, Math.ceil((t - now) / DAY_MS))
}

// Builds the task list for a single goal-uni. Each book in
// `goal.books` becomes a "Ler {title}" task (title = first segment before
// " - "); plus two fixed admin tasks: "Fazer inscrição" and
// "Pagar taxa de inscrição". The book-task `bookKey` matches the shape
// the readBooks map uses elsewhere (`{goalId}-{bookString}`).
export function buildGoalTasks(goal: University): GoalTask[] {
  const tasks: GoalTask[] = []

  if (Array.isArray(goal.books)) {
    for (const book of goal.books) {
      tasks.push({
        id: `${goal.id}-${book}`,
        bookKey: `${goal.id}-${book}`,
        text: `Ler "${book.split(' - ')[0]}"`,
        type: 'book',
      })
    }
  }

  tasks.push({
    id: `${goal.id}-inscricao`,
    text: 'Fazer inscrição',
    type: 'inscricao',
  })
  tasks.push({
    id: `${goal.id}-taxa`,
    text: 'Pagar taxa de inscrição',
    type: 'taxa',
  })

  return tasks
}

// Counts how many tasks are completed. Book tasks check the readBooks map
// for `'read'` (in-progress reads stay in the to-do bucket); admin tasks
// check the completedTodos map.
export function countCompleted(
  tasks: GoalTask[],
  readBooks: Record<string, string>,
  completedTodos: Record<string, boolean>
): number {
  let completed = 0
  for (const t of tasks) {
    if (t.type === 'book') {
      if (t.bookKey && readBooks[t.bookKey] === 'read') completed += 1
    } else if (completedTodos[t.id]) {
      completed += 1
    }
  }
  return completed
}

// Convenience: tasks + completed/total counts in one shot for a goal-uni.
export function summariseGoal(
  goal: University,
  readBooks: Record<string, string>,
  completedTodos: Record<string, boolean>
): {
  tasks: GoalTask[]
  completed: number
  total: number
  percent: number
  daysUntil: number | null
} {
  const tasks = buildGoalTasks(goal)
  const completed = countCompleted(tasks, readBooks, completedTodos)
  const total = tasks.length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return {
    tasks,
    completed,
    total,
    percent,
    daysUntil: daysUntilNextExam(goal),
  }
}
