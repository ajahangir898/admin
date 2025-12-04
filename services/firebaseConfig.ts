
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Pull credentials from environment when available to avoid hardcoding secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAAeDj0vikld55XggkJJLhzgH7LgRML5QI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ecom-70d36.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecom-70d36",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecom-70d36.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "503757028124",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:503757028124:web:84339026fbf0983a3ed8d9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1KNEE2352W"
};

// Initialize Firebase only once to avoid duplicate-app errors during HMR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
