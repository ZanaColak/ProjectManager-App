import {doc, getDoc, setDoc} from "firebase/firestore";
import {database} from "../config/firebase";

export const ensureDefaultData = async (uid, email) => {
    const userRef = doc(database, "users", uid);
    const userSnap = await getDoc(userRef);

    try {
        // Define departments
        const allDepartments = ["Fuglebakken", "Bagsværd", "Kalundborg"];
        const memberDepartments = ["Fuglebakken", "Bagsværd"]; // Members only get 2 departments

        if (!userSnap.exists()) {
            // Create new user document with default role and departments
            await setDoc(userRef, {
                email: email,
                role: "member",
                departments: memberDepartments,
                createdAt: new Date(),
            });
        } else {
            // Update existing user - check role and assign departments accordingly
            const userData = userSnap.data();
            const role = userData.role || "member";

            // Assign departments based on role
            const departmentsToAssign = role === "admin" ? allDepartments : memberDepartments;

            await setDoc(
                userRef,
                {departments: departmentsToAssign, updatedAt: new Date()},
                {merge: true} // Merge to avoid overwriting other fields
            );
        }
    } catch (error) {
        console.error("Error ensuring default role and departments:", error);
    }
};


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