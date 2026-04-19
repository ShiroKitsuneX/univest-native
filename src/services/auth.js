import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase/config";

export const authService = {
  onAuthStateChanged: (callback) => onAuthStateChanged(auth, callback),
  
  signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
  
  signUp: (email, password) => createUserWithEmailAndPassword(auth, email, password),
  
  signOut: () => signOut(auth),
  
  sendVerification: () => sendEmailVerification(auth.currentUser),
  
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
};

export default authService;