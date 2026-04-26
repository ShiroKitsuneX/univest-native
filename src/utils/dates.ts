export const getMonthFromKey = (key: string | undefined | null): number => {
  const months: Record<string, number> = {
    JAN: 1,
    FEV: 2,
    MAR: 3,
    ABR: 4,
    MAI: 5,
    JUN: 6,
    JUL: 7,
    AGO: 8,
    SET: 9,
    OUT: 10,
    NOV: 11,
    DEZ: 12,
  }
  return (key && months[key]) || 12
}

// Pulls the first 3-letter month token (e.g. "OUT") out of a free-form exam
// label like "OUT/2025" or "Provas em OUT" and maps it to a month number.
// Used to sort exams chronologically across feed/explorar/sort modal.
export const getMonthFromExamLabel = (label: string | undefined): number =>
  getMonthFromKey(label?.match(/[A-Z]{3}/)?.[0] || 'DEZ')
