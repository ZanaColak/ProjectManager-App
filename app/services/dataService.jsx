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
  if (error) {console.log("Error fetching users:", error);}

  const users = values?.docs.map((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log("Fetched user:", userData); // Log hver bruger for at debugge
        return userData;
      })
      .filter((user) =>
          Array.isArray(user.departments) &&
          user.departments.includes(department)
      ) || []; // Tjek om departments er et array før includes

  return { users, loading, error };
};

