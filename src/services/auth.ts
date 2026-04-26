import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { auth } from '@/core/firebase/client'
import { createInitialUserProfile } from '@/features/auth/repositories/authRepository'
import { clearLocalUserData } from './storage'

export const onAuthChange = (cb: (user: User | null) => void): (() => void) =>
  onAuthStateChanged(auth, cb)

export const signIn = (
  email: string,
  password: string
): Promise<UserCredential> => signInWithEmailAndPassword(auth, email, password)

type SignUpInput = {
  email: string
  password: string
  nome: string
  sobrenome?: string
  dataNascimento: string
}

export const signUp = async ({
  email,
  password,
  nome,
  sobrenome,
  dataNascimento,
}: SignUpInput): Promise<UserCredential> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await createInitialUserProfile(cred.user.uid, {
    email: cred.user.email,
    nome: nome.trim(),
    sobrenome: sobrenome?.trim() || '',
    dataNascimento: dataNascimento.trim(),
  })
  await sendEmailVerification(cred.user)
  return cred
}

export const resetPassword = (email: string): Promise<void> =>
  sendPasswordResetEmail(auth, email)

export const logout = async (): Promise<void> => {
  await signOut(auth)
  await clearLocalUserData()
}

export const getAuthErrorMessage = (
  err: { code?: string } | Error,
  mode: 'login' | 'signup'
): string => {
  const code = (err as { code?: string }).code || ''
  if (code.includes('user-not-found') || code.includes('wrong-password'))
    return 'E-mail ou senha incorretos'
  if (code.includes('email-already-in-use')) return 'E-mail já cadastrado'
  if (code.includes('invalid-email')) return 'E-mail inválido'
  if (code.includes('weak-password')) return 'Senha muito fraca'
  if (code.includes('network'))
    return 'Erro de conexão. Verifique sua internet.'
  if (code.includes('too-many-requests'))
    return 'Muitas tentativas. Tente novamente mais tarde.'
  return mode === 'login'
    ? 'Erro ao fazer login. Verifique sua conexão.'
    : 'Erro ao criar conta. Verifique sua conexão.'
}
