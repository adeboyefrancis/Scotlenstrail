
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "scotlens-trails.firebaseapp.com",
  projectId: "scotlens-trails",
  storageBucket: "scotlens-trails.firebasestorage.app",
  messagingSenderId: "84142750143",
  appId: "1:84142750143:web:2c17ecee54cd9c85c3c90a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
