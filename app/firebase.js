// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
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

// Function to ensure every user gets a default role of 'member' in Firestore
export const ensureDefaultRole = async (uid, email) => {
    const userRef = doc(database, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            email: email,
            role: "member", // Default role
            createdAt: new Date(),
        });
    }
};

// Function to retrieve the user's role from Firestore
export const getUserRole = async (uid) => {
    const userRef = doc(database, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data().role;
    } else {
        console.error("User not found in Firestore.");
        return null;
    }
};

export { app, database, storage, auth };
