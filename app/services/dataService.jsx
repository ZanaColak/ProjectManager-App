import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { database } from "../config/firebase";

// Hent projekter for et specifikt department
export const fetchProjects = (department) => {
  const [values, loading, error] = useCollection(
    collection(database, "projects")
  );
  const projects =
    values?.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((project) => project.department === department) || [];

  return { projects, loading, error };
};

// Hent brugere for et specifikt department
export const fetchUsers = (department) => {
  const [values, loading, error] = useCollection(collection(database, "users"));
  if (error) {
    console.log("Error fetching users:", error);
  }

  const users =
    values?.docs
      .map((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log("Fetched user:", userData); // Log hver bruger for at debugge
        return userData;
      })
      .filter(
        (user) =>
          Array.isArray(user.departments) &&
          user.departments.includes(department)
      ) || []; // Tjek om departments er et array før includes

  return { users, loading, error };
};

// Tilføj en ny bruger
export const addUser = async (department, email, role) => {
  try {
    const newUserRef = doc(collection(database, "users"));
    await setDoc(newUserRef, {
      email,
      role,
      departments: [department], // Antager, at brugeren tilhører dette department
    });
    console.log("User added successfully");
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Opdater en eksisterende bruger
export const updateUser = async (department, userId, email, role) => {
  try {
    const userRef = doc(database, "users", userId);
    await updateDoc(userRef, {
      email,
      role,
      departments: [department], // Opdaterer med det ønskede department
    });
    console.log("User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Slet en bruger
export const deleteUser = async (department, userId) => {
  try {
    const userRef = doc(database, "users", userId);
    await deleteDoc(userRef);
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
