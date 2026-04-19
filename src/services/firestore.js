import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const firestoreService = {
  getCollection: (collectionName) => getDocs(collection(db, collectionName),
  
  getDocument: (collectionName, docId) => getDoc(doc(db, collectionName, docId)),
  
  setDocument: (collectionName, docId, data, options = {}) =>
    setDoc(doc(db, collectionName, docId), data, options),
  
  updateDocument: (collectionName, docId, data) =>
    updateDoc(doc(db, collectionName, docId), data),
  
  deleteDocument: (collectionName, docId) =>
    deleteDoc(doc(db, collectionName, docId)),
  
  addDocument: (collectionName, data) =>
    addDoc(collection(db, collectionName), data),
  
  batch: () => writeBatch(db),
  
  increment: (value) => increment(value),
  
  arrayUnion: (...values) => arrayUnion(...values),
  
  arrayRemove: (...values) => arrayRemove(...values),
  
  timestamp: () => serverTimestamp(),
};

export default firestoreService;