import { getMonthFromKey } from '../dates';

describe('getMonthFromKey', () => {
  it('returns correct month numbers', () => {
    expect(getMonthFromKey('JAN')).toBe(1);
    expect(getMonthFromKey('DEZ')).toBe(12);
  });

  it('returns 12 for unknown', () => {
    expect(getMonthFromKey('XYZ')).toBe(12);
  });
});
