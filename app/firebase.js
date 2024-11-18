// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app }