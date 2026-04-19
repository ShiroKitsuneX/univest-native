export { db, auth, storage } from "../firebase/config";
export {
  collection, getDocs, doc, setDoc, getDoc, deleteDoc,
  updateDoc, increment, addDoc, serverTimestamp, arrayUnion, arrayRemove,
  writeBatch,
} from "firebase/firestore";
export {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail,
} from "firebase/auth";