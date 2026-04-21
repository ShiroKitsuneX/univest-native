export const validatePassword = pwd => {
  if (!pwd) return 'Senha é obrigatória'
  if (pwd.length < 8) return 'Mínimo 8 caracteres'
  if (pwd.length > 64) return 'Máximo 64 caracteres'
  if (!/\d/.test(pwd)) return 'Pelo menos 1 número'
  if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd)) return 'Maiúscula e minúscula'
  if (!/[!@#$%&*?,]/.test(pwd)) return 'Caractere especial (!@#$%...)'
  return ''
}
