
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAeDj0vikld55XggkJJLhzgH7LgRML5QI",
  authDomain: "ecom-70d36.firebaseapp.com",
  projectId: "ecom-70d36",
  storageBucket: "ecom-70d36.firebasestorage.app",
  messagingSenderId: "503757028124",
  appId: "1:503757028124:web:84339026fbf0983a3ed8d9",
  measurementId: "G-1KNEE2352W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
