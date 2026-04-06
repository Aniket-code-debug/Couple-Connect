import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import auth from '@react-native-firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCBldmZEDkEtNINNcAwcw235Dp4qeV0iyI",
  authDomain: "coupleconnect-e80bc.firebaseapp.com",
  projectId: "coupleconnect-e80bc",
  storageBucket: "coupleconnect-e80bc.firebasestorage.app",
  messagingSenderId: "277068054452",
  appId: "1:277068054452:web:0fdd6ac11e3c5ba64abce1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;