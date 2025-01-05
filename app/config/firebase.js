// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZPkLmX15vUa1baJn7Ghh6zVHNyHDpzbQ",
    authDomain: "projectmaneger-novonesis.firebaseapp.com",
    projectId: "projectmaneger-novonesis",
    storageBucket: "projectmaneger-novonesis.firebasestorage.app",
    messagingSenderId: "1049257805426",
    appId: "1:1049257805426:web:a38785e3e29e8b230ee4eb",
    measurementId: "G-EHEB1J5F3D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth with platform-specific handling
const auth =
    Platform.OS === "web"
        ? getAuth(app)
        : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export { app, database, storage, auth };
