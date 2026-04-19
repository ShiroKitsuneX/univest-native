export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  if (!password || password.length < 8) return false;
  if (password.length > 64) return false;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasNumber && hasUpper && hasLower && hasSpecial;
};

export const isValidBirthdate = (dateStr) => {
  if (!dateStr) return false;
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateStr.match(regex);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  return true;
};

export const isValidName = (name) => {
  if (!name || name.length < 2) return false;
  if (name.length > 50) return false;
  return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
};

export const isValidURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateSignup = (data) => {
  const errors = {};
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }
  
  if (!data.password || !isValidPassword(data.password)) {
    errors.password = 'Senha deve ter 8+ caracteres, número, maiúscula, minúscula e especial';
  }
  
  if (!data.nome || !isValidName(data.nome)) {
    errors.nome = 'Nome inválido';
  }
  
  if (!data.sobrenome || !isValidName(data.sobrenome)) {
    errors.sobrenome = 'Sobrenome inválido';
  }
  
  if (!data.nascimento || !isValidBirthdate(data.nascimento)) {
    errors.nascimento = 'Data de nascimento inválida (DD/MM/AAAA)';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidBirthdate,
  isValidName,
  isValidPhone,
  isValidURL,
  validateSignup,
};