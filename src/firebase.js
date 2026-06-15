import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getMessaging, isSupported } from 'firebase/messaging';

// TODO: Replace with your Firebase project config from Firebase Console
// Go to: Firebase Console > Project Settings > Your Apps > SDK setup
const firebaseConfig = {
  apiKey: "AIzaSyA1ynqkZcPunYUzpo7xKOEvZn5K58KOk6s",
  authDomain: "svs-house-c8b63.firebaseapp.com",
  databaseURL: "https://svs-house-c8b63-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "svs-house-c8b63",
  storageBucket: "svs-house-c8b63.firebasestorage.app",
  messagingSenderId: "366629481106",
  appId: "1:366629481106:web:b4d822b03c184d6bc4544b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (supported) return getMessaging(app);
  return null;
};

export default app;
