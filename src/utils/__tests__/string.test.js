import { removeAccents } from '../string';

describe('removeAccents', () => {
  it('removes common accents', () => {
    expect(removeAccents('café')).toBe('cafe');
    expect(removeAccents('ação')).toBe('acao');
    expect(removeAccents('ñ')).toBe('n');
  });

  it('keeps plain characters', () => {
    expect(removeAccents('hello')).toBe('hello');
    expect(removeAccents('123')).toBe('123');
  });

  it('handles empty string', () => {
    expect(removeAccents('')).toBe('');
  });
});
