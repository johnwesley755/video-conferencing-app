import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbpcrbGOZLm9kdJjJF8cSu_xpZ2Hk3Jqo",
  authDomain: "video-app-65afc.firebaseapp.com",
  projectId: "video-app-65afc",
  storageBucket: "video-app-65afc.firebasestorage.app",
  messagingSenderId: "916362021886",
  appId: "1:916362021886:web:a72830ed11170635ad8eaf",
  measurementId: "G-1DZ6Y7M9LB"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;