import { Alert } from "react-native";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserRole } from "../services/userService";

export const signIn = async (email, password, onSuccess, onError) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
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
