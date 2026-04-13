import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEl55svAj-rZok_IceDnqKKIWkGb4LPbM",
  authDomain: "univest-6b10d.firebaseapp.com",
  projectId: "univest-6b10d",
  storageBucket: "univest-6b10d.firebasestorage.app",
  messagingSenderId: "651202207735",
  appId: "1:651202207735:ios:com.univest.app",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
