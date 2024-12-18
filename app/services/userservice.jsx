// Function to ensure every user gets a default role of 'member' in Firestore
import {doc, getDoc, setDoc} from "firebase/firestore";
import {database} from "../config/firebase";

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