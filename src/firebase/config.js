import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAzNGqLgXxT0NkNYXP3YJ0hS8BldLm5_gE',
  authDomain: 'univest-6b10d.firebaseapp.com',
  projectId: 'univest-6b10d',
  storageBucket: 'univest-6b10d.firebasestorage.app',
  messagingSenderId: '651202207735',
  appId: '1:651202207735:ios:fc9bc24087a1a8b803d8f2',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})
