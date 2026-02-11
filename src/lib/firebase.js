import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDL83Ub2Zn1UosUZB1eJ6Xd0Vf7P5mGTtQ",
  authDomain: "pixel-cut-7f91c.firebaseapp.com",
  projectId: "pixel-cut-7f91c",
  storageBucket: "pixel-cut-7f91c.firebasestorage.app",
  messagingSenderId: "531455601372",
  appId: "1:531455601372:web:05286e86865771a7e9a219",
  measurementId: "G-RZZVVV672N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const realtimeDb = getDatabase(app);

export default app;
