import {
  validatePassword,
  validateBirthdate,
  validateEmail,
} from '../validation'

describe('validateEmail', () => {
  test('rejects empty', () => {
    expect(validateEmail('')).toBe('E-mail é obrigatório')
  })
  test('rejects malformed', () => {
    expect(validateEmail('not-an-email')).toBe('E-mail inválido')
    expect(validateEmail('a@b')).toBe('E-mail inválido')
    expect(validateEmail('a @b.c')).toBe('E-mail inválido')
  })
  test('accepts valid', () => {
    expect(validateEmail('user@example.com')).toBe('')
    expect(validateEmail('  user@example.com  ')).toBe('')
  })
})

describe('validateBirthdate', () => {
  test('rejects empty', () => {
    expect(validateBirthdate('')).toBe('Data de nascimento é obrigatória')
  })
  test('rejects wrong format', () => {
    expect(validateBirthdate('1995-01-15')).toBe('Use o formato DD/MM/AAAA')
    expect(validateBirthdate('15-01-1995')).toBe('Use o formato DD/MM/AAAA')
    expect(validateBirthdate('1/1/95')).toBe('Use o formato DD/MM/AAAA')
  })
  test('rejects impossible dates', () => {
    expect(validateBirthdate('31/02/1995')).toBe('Data inválida')
    expect(validateBirthdate('00/01/1995')).toBe('Data inválida')
  })
  test('rejects future dates', () => {
    const next = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
    const dd = String(next.getDate()).padStart(2, '0')
    const mm = String(next.getMonth() + 1).padStart(2, '0')
    const yyyy = next.getFullYear()
    expect(validateBirthdate(`${dd}/${mm}/${yyyy}`)).toBe(
      'Data não pode ser no futuro'
    )
  })
  test('rejects too young', () => {
    const recent = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
    const dd = String(recent.getDate()).padStart(2, '0')
    const mm = String(recent.getMonth() + 1).padStart(2, '0')
    const yyyy = recent.getFullYear()
    expect(validateBirthdate(`${dd}/${mm}/${yyyy}`)).toBe(
      'Idade mínima de 5 anos'
    )
  })
  test('accepts realistic birthdate', () => {
    expect(validateBirthdate('15/06/2000')).toBe('')
  })
})

describe('validatePassword', () => {
  test('still rejects weak', () => {
    expect(validatePassword('short')).toBe('Mínimo 8 caracteres')
  })
  test('accepts strong', () => {
    expect(validatePassword('Abcdef1!')).toBe('')
  })
})
