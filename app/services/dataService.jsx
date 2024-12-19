import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { database } from "../config/firebase";

export const fetchProjects = (department) => {
    const [values, loading, error] = useCollection(collection(database, "projects"));
    const projects = values?.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((project) => project.department === department) || [];

    return { projects, loading, error };
};
