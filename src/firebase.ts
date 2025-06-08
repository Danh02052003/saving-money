import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVG6xntMRsBFCNQRBKsL8pmmqGXjR1u2s",
  authDomain: "saving-money-63d90.firebaseapp.com",
  projectId: "saving-money-63d90",
  storageBucket: "saving-money-63d90.firebasestorage.app",
  messagingSenderId: "278211043342",
  appId: "1:278211043342:web:0d370bbbfd78fcbaae5c5f",
  measurementId: "G-L2R8FRRTWR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 