import { getMonthFromKey } from '@/utils/dates'

describe('getMonthFromKey', () => {
  it('maps Portuguese month abbreviations to 1-indexed month numbers', () => {
    expect(getMonthFromKey('JAN')).toBe(1)
    expect(getMonthFromKey('JUN')).toBe(6)
    expect(getMonthFromKey('DEZ')).toBe(12)
  })

  it('falls back to 12 for unknown keys', () => {
    expect(getMonthFromKey('XYZ')).toBe(12)
    expect(getMonthFromKey('')).toBe(12)
    expect(getMonthFromKey(undefined)).toBe(12)
  })
})
