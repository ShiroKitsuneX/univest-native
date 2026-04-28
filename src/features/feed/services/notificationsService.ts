import {
  createNotification,
  fetchNotifications,
} from '@/features/feed/repositories/notificationsRepository'
import type { University } from '@/stores/universitiesStore'
import { logger } from '@/services/logger'

// Days-out thresholds at which we want a reminder notification to exist.
// Hits at "30 days", "7 days", and "1 day" before each goal-uni exam.
const REMINDER_THRESHOLDS = [30, 7, 1] as const

function daysUntil(dateIso: string | undefined): number | null {
  if (!dateIso) return null
  const t = Date.parse(dateIso)
  if (Number.isNaN(t)) return null
  return Math.ceil((t - Date.now()) / 86_400_000)
}

function pickThreshold(d: number): number | null {
  // Match the smallest threshold the exam date is at-or-below — so a prova
  // 5 days out picks the "7 day" reminder window, not the "30 day" one.
  for (const t of REMINDER_THRESHOLDS) {
    if (d <= t && d >= 0) return t
  }
  return null
}

/**
 * Idempotently ensures notifications exist for any upcoming goal-uni exams
 * within a reminder window. Run on app open (after sign-in) and after the
 * user changes their goal universities. Safe to call repeatedly — the
 * dedupeKey (`exam-{uniId}-{examId}-{threshold}`) prevents duplicates.
 *
 * Failures are logged and swallowed; this is a best-effort enhancement and
 * must never block the UI.
 */
export async function ensureExamReminders(
  uid: string,
  goalsUnis: University[]
): Promise<void> {
  if (!uid || !Array.isArray(goalsUnis) || goalsUnis.length === 0) return

  try {
    // Pull existing notifications once so we can skip any reminder that
    // already exists locally without writing. (Firestore writes via setDoc
    // with a dedupe id are idempotent on the server too — this just spares
    // us the network round-trips.)
    const existing = await fetchNotifications(uid)
    const existingIds = new Set(existing.map(n => n.id))

    const candidates: Array<{
      uni: University
      exam: NonNullable<University['exams']>[number]
      d: number
      threshold: number
    }> = []

    for (const uni of goalsUnis) {
      const exams = uni.exams || []
      for (const exam of exams) {
        if (exam.status && exam.status !== 'upcoming') continue
        const d = daysUntil(exam.date)
        if (d === null) continue
        const threshold = pickThreshold(d)
        if (threshold === null) continue
        candidates.push({ uni, exam, d, threshold })
      }
    }

    if (candidates.length === 0) return

    await Promise.all(
      candidates.map(async ({ uni, exam, d, threshold }) => {
        const examId = exam.id || exam.name || 'exam'
        const dedupeKey = `exam-${uni.id}-${examId}-${threshold}`
        if (existingIds.has(dedupeKey)) return

        const examLabel = exam.name || exam.subject || 'Prova'
        const uniName = uni.name || 'Universidade'
        const body =
          d <= 1
            ? `${examLabel} é ${d === 0 ? 'hoje' : 'amanhã'}. Boa sorte!`
            : `${examLabel} em ${d} dias. Hora de revisar.`

        await createNotification({
          userId: uid,
          type: 'exam',
          title: `${uniName} · ${threshold === 1 ? 'Última chamada' : `${threshold} dias`}`,
          body,
          uniId: uni.id != null ? String(uni.id) : undefined,
          dedupeKey,
        })
      })
    )
  } catch (error) {
    logger.warn('ensureExamReminders error:', error)
  }
}
