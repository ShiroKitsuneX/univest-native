import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

export const onAuthChange = cb => onAuthStateChanged(auth, cb)

export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const signUp = async ({
  email,
  password,
  nome,
  sobrenome,
  dataNascimento,
}) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    email: cred.user.email,
    nome: nome.trim(),
    sobrenome: sobrenome?.trim() || '',
    dataNascimento: dataNascimento.trim(),
    tipo: 'usuario',
    done: false,
    followedUnis: [],
    updatedAt: new Date().toISOString(),
  })
  await sendEmailVerification(cred.user)
  return cred
}

export const resetPassword = email => sendPasswordResetEmail(auth, email)

export const logout = () => signOut(auth)

export const getAuthErrorMessage = (err, mode) => {
  const code = err.code || ''
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
