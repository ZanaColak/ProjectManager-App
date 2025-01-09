import { doc, getDoc } from "firebase/firestore";
import { database } from "../config/firebase";

// Function to retrieve the user's role from Firestore
export const getUserRole = async (uid) => {
    const userRef = doc(database, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data().role;
    } else {
        return console.error("User not found in Firestore.") || null;
    }
};