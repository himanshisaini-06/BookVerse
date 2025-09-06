// firebase.js - Create this file in your src folder
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTqcs55CAr_wKD9JSUua_PGWfKRvPF-iQ",
  authDomain: "bookverse-himanshi.firebaseapp.com",
  projectId: "bookverse-himanshi",
  storageBucket: "bookverse-himanshi.appspot.com",
  messagingSenderId: "165229657841",
  appId: "1:165229657841:web:3eae5cf04ef35d2757f350",
  measurementId: "G-9D4FHJS9NG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;