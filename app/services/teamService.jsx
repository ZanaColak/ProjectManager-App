import { auth, database } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { showAlert } from "../components/utill";

export const createUser = async (userData, onSuccess, onError) => {
    const { firstName, lastName, email, password, userRole, userDepartments } = userData;

    if (!firstName || !lastName || !email || password.length < 6 || userDepartments.length === 0) {
        showAlert("Error", "All fields must be filled, and password must be at least 6 characters long.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await setDoc(doc(database, "users", userId), {
            firstName,
            lastName,
            email,
            password,
            role: userRole,
            departments: userDepartments,
            createdAt: new Date(),
        });

        onSuccess?.();
        showAlert("Success", "User created successfully.");
    } catch (error) {
        console.error("Error creating user:", error);
        onError?.(error.message);
        showAlert("Error", `Failed to create user: ${error.message}`);
    }
};

export const deleteUser = async (id, onSuccess, onError) => {
    try {
        await deleteDoc(doc(database, "users", id));
        onSuccess?.();
        showAlert("Success", "User deleted successfully.");
    } catch (error) {
        console.error("Error deleting user:", error);
        onError?.(error.message);
        showAlert("Error", `Failed to delete user: ${error.message}`);
    }
};
