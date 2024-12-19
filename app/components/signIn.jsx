import { Alert } from "react-native";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserRole, ensureDefaultData } from "../services/userService";

export const signIn = async (email, password, onSuccess, onError) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Ensure user role exists in Firestore
        await ensureDefaultData(uid, userCredential.user.email);

        // Fetch role and proceed
        const role = await getUserRole(uid);
        if (!role) {
            Alert.alert("Role not assigned to this user.");
            return;
        }

        onSuccess(uid, role);
    } catch (error) {
        onError(error.message || "Something went wrong.");
    }
};
