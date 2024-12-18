// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZPkLmX15vUa1baJn7Ghh6zVHNyHDpzbQ",
    authDomain: "projectmaneger-novonesis.firebaseapp.com",
    projectId: "projectmaneger-novonesis",
    storageBucket: "projectmaneger-novonesis.firebasestorage.app",
    messagingSenderId: "1049257805426",
    appId: "1:1049257805426:web:a38785e3e29e8b230ee4eb",
    measurementId: "G-EHEB1J5F3D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, database, storage, auth };