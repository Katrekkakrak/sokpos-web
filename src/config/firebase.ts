import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCNfVWuR8GFiLBw1Vb4sKfKYlfjewY_EQ",
  authDomain: "quickbill-kh.firebaseapp.com",
  projectId: "quickbill-kh",
  storageBucket: "quickbill-kh.firebasestorage.app",
  messagingSenderId: "218695934478",
  appId: "1:218695934478:web:e85605aaad3c49e6cf125f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
