// ENEM subject metadata. Single source of truth for radar/bar-chart labels + colors.
// `short` = radar label, `long` = bar-chart series name + comparativo label.
// `score(s)` reads the raw score off a grade object `g.s`, normalizing Redação (0–1000)
// to the 0–100 scale used by every other area.
export const ENEM_SUBJECTS = [
  { k: 'l', short: 'Ling.', long: 'Linguagens', color: '#f87171' },
  { k: 'h', short: 'Humanas', long: 'Humanas', color: '#a78bfa' },
  { k: 'n', short: 'Nat.', long: 'Natureza', color: '#34d399' },
  { k: 'm', short: 'Mat.', long: 'Matemática', color: '#fbbf24' },
  { k: 'r', short: 'Redação', long: 'Redação', color: '#60a5fa' },
]

export const subjectScore = (s, k) =>
  k === 'r' ? Math.round((s?.r || 0) / 10) : s?.[k] || 0
