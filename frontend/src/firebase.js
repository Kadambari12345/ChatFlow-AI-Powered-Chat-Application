
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyCqM1780XyW8_ZjgJFcRBFlDPTboFbDEEk",
  authDomain: "chatflow-9ef2e.firebaseapp.com",
  projectId: "chatflow-9ef2e",
  storageBucket: "chatflow-9ef2e.firebasestorage.app",
  messagingSenderId: "628428213995",
  appId: "1:628428213995:web:84b281b147ba7acfd0b8ae"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);