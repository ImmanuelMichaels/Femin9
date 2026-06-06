// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";        
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyCSWfGltSa8GCn3rJl-YIkL9rH6G_6z-Cw",
  authDomain: "femin9-womens-health.firebaseapp.com",
  projectId: "femin9-womens-health",
  storageBucket: "femin9-womens-health.firebasestorage.app",
  messagingSenderId: "520840377156",
  appId: "1:520840377156:web:4f73b71b4217ed986bdd11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };