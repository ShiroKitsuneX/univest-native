export const validatePassword = (pwd: string | undefined | null): string => {
  if (!pwd) return 'Senha é obrigatória'
  if (pwd.length < 8) return 'Mínimo 8 caracteres'
  if (pwd.length > 64) return 'Máximo 64 caracteres'
  if (!/\d/.test(pwd)) return 'Pelo menos 1 número'
  if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd)) return 'Maiúscula e minúscula'
  if (!/[!@#$%&*?,]/.test(pwd)) return 'Caractere especial (!@#$%...)'
  return ''
}

// Accepts DD/MM/YYYY (Brazilian standard). Validates real calendar dates,
// rejects future dates, and rejects users under 5 or over 120 years old.
export const validateBirthdate = (raw: string | undefined | null): string => {
  if (!raw) return 'Data de nascimento é obrigatória'
  const trimmed = raw.trim()
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return 'Use o formato DD/MM/AAAA'
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const dt = new Date(year, month - 1, day)
  const isRealDate =
    dt.getFullYear() === year &&
    dt.getMonth() === month - 1 &&
    dt.getDate() === day
  if (!isRealDate) return 'Data inválida'
  const now = new Date()
  if (dt > now) return 'Data não pode ser no futuro'
  const age =
    now.getFullYear() -
    year -
    (now.getMonth() < month - 1 ||
    (now.getMonth() === month - 1 && now.getDate() < day)
      ? 1
      : 0)
  if (age < 5) return 'Idade mínima de 5 anos'
  if (age > 120) return 'Idade inválida'
  return ''
}

// Lightweight email shape check. Real verification still happens via Firebase
// `sendEmailVerification`; this just rejects obvious malformed strings before
// hitting the network.
export const validateEmail = (email: string | undefined | null): string => {
  if (!email) return 'E-mail é obrigatório'
  const trimmed = email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'E-mail inválido'
  return ''
}
