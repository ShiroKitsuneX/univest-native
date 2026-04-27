// Theme palettes (dark + light) and tag colour families.
// The locked design language lives in docs/REDESIGN_PLAN.md > "Design language".
// `ThemeColors` shape is fixed — adding properties is fine, removing/renaming
// requires migrating every call-site (currently ~150+ usages of `T.accent`,
// `T.acBg`, etc.).

export type TagColor = { bg: string; tx: string; b: string }
export type TagPalette = {
  alert: TagColor
  lista: TagColor
  nota: TagColor
  simulado: TagColor
  news: TagColor
}

// Tag families harmonised with the new violet primary. Hues kept distinct so
// the five categories remain glanceable.
export const TAG_D: TagPalette = {
  alert: { bg: '#2a1c00', tx: '#fbbf24', b: '#78350f' },
  lista: { bg: '#0a2820', tx: '#34d399', b: '#065f46' },
  nota: { bg: '#101a3a', tx: '#7c9cff', b: '#1e3a8a' },
  simulado: { bg: '#1f1136', tx: '#c4b5fd', b: '#5b21b6' },
  news: { bg: '#2a0f24', tx: '#f0abfc', b: '#86198f' },
}
export const TAG_L: TagPalette = {
  alert: { bg: '#fff7ed', tx: '#c2410c', b: '#fed7aa' },
  lista: { bg: '#ecfdf5', tx: '#047857', b: '#a7f3d0' },
  nota: { bg: '#eff6ff', tx: '#1d4ed8', b: '#bfdbfe' },
  simulado: { bg: '#f5f0ff', tx: '#6d28d9', b: '#ddd6fe' },
  news: { bg: '#fdf2f8', tx: '#a21caf', b: '#f5d0fe' },
}

export type ThemeColors = {
  bg: string
  card: string
  card2: string
  border: string
  text: string
  sub: string
  muted: string
  // `accent` is the brand primary (violet). Existing consumers reference
  // `T.accent` for filled CTAs, active pills, focus rings, badges.
  accent: string
  // `acBg` is the soft tinted background that accompanies `accent` (active
  // chip background, hover surfaces, ring tints).
  acBg: string
  nav: string
  inp: string
  inpB: string
}

// Dark theme — near-black with violet undertone (matches inspiration ref
// "04.33.01" + "04.38.50" + "02.53.54").
export const DK: ThemeColors = {
  bg: '#0B0B12',
  card: '#15151F',
  card2: '#1C1C2A',
  border: '#23233A',
  text: '#ECEAFB',
  sub: '#9C9AB8',
  muted: '#5C5A78',
  accent: '#7C5CFF',
  acBg: 'rgba(124,92,255,0.18)',
  nav: '#0B0B12',
  inp: '#1C1C2A',
  inpB: '#2A2A42',
}

// Light theme — lavender-tinted off-white (matches inspiration ref
// "02.53.54" learning-app reference).
export const LT: ThemeColors = {
  bg: '#F6F4FB',
  card: '#FFFFFF',
  card2: '#F0EEFA',
  border: '#E4E1F0',
  text: '#1A1530',
  sub: '#5A5478',
  muted: '#9A95B0',
  accent: '#7C5CFF',
  acBg: 'rgba(124,92,255,0.10)',
  nav: '#FFFFFF',
  inp: '#FFFFFF',
  inpB: '#E4E1F0',
}

// Shared brand constants (theme-independent). Used for primary-coloured
// shadows / glows where we don't want the colour to flip with theme.
export const BRAND = {
  primary: '#7C5CFF',
  primaryPress: '#6D4DEF',
  primaryGlow: 'rgba(124,92,255,0.32)',
} as const

// Domain accent palette — soft pastel backgrounds for stat-card icon tiles
// so dashboards scan by colour. Text/icon colour atop these pastels lives
// alongside as `*Fg`. See REDESIGN_PLAN.md > "Stat / domain accent palette".
export type DomainTone =
  | 'progress'
  | 'simulado'
  | 'notas'
  | 'goal'
  | 'news'

export type DomainAccent = { bg: string; fg: string }
export type DomainPalette = Record<DomainTone, DomainAccent>

export const DOMAIN_D: DomainPalette = {
  progress: { bg: '#1F1840', fg: '#C4B5FD' },
  simulado: { bg: '#2A0F24', fg: '#F0ABFC' },
  notas: { bg: '#101A3A', fg: '#7C9CFF' },
  goal: { bg: '#2A1C00', fg: '#FBBF24' },
  news: { bg: '#0A2820', fg: '#34D399' },
}

export const DOMAIN_L: DomainPalette = {
  progress: { bg: '#EDE9FE', fg: '#6D28D9' },
  simulado: { bg: '#FCE7F3', fg: '#A21CAF' },
  notas: { bg: '#DBEAFE', fg: '#1D4ED8' },
  goal: { bg: '#FEF3C7', fg: '#B45309' },
  news: { bg: '#DCFCE7', fg: '#047857' },
}
