import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBqlmCg529ILuG0DoxhYeVvrw11SUOCJzw",
  authDomain: "stickynoteboard.firebaseapp.com",
  projectId: "stickynoteboard",
  storageBucket: "stickynoteboard.firebasestorage.app",
  messagingSenderId: "388409253226",
  appId: "1:388409253226:web:c9ec4fb0886af28b8cd913",
  measurementId: "G-ZRWLYH7F2R"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "your-api-key" && 
         firebaseConfig.projectId !== "your-project-id";
};

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

export const isFirebaseEnabled = () => db !== null;
export const getDb = () => db;
export const WORKSPACE_ID = "default";

