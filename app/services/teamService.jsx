import { auth, database } from "../config/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { showAlert } from "../components/utill";

export const createUser = async (userData, onSuccess, onError) => {
    const { firstName, lastName, email, password, userRole, userDepartments } = userData;

    if (!firstName || !lastName || !email || password.length < 6 || userDepartments.length === 0) {
        showAlert("Fejl", "Alle felter skal udfyldes, og adgangskoden skal være mindst 6 tegn lang.");
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
        showAlert("Succes", "Bruger oprettet succesfuldt.");
    } catch (error) {
        console.error("Error creating user:", error);
        onError?.(error.message);
        showAlert("Fejl", `Kunne ikke oprette bruger: ${error.message}`);
    }
};

export const deleteUser = async (id, onSuccess, onError) => {
    try {
        await deleteDoc(doc(database, "users", id));
        onSuccess?.();
        showAlert("Succes", "Bruger slettet succesfuldt.");
    } catch (error) {
        console.error("Error deleting user:", error);
        onError?.(error.message);
        showAlert("Fejl", `Kunne ikke slette bruger: ${error.message}`);
    }
};

export const updateUserDetails = async (userId, field, value, onSuccess, onError) => {
    try {
        const userRef = doc(database, "users", userId);
        const updateData = field === "departments" ? { departments: value } : { [field]: value };

        await updateDoc(userRef, updateData);

        if (onSuccess) onSuccess();
        showAlert("Succes", `${field} opdateret succesfuldt.`);
    } catch (error) {
        console.error(`Error updating ${field}:`, error);
        if (onError) onError(error.message);
        showAlert("Fejl", `Kunne ikke opdatere ${field}: ${error.message}`);
    }
};
