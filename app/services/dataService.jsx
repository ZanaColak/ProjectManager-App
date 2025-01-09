import {collection, query, where, getDocs, doc} from "firebase/firestore";
import {useCollection} from "react-firebase-hooks/firestore";
import {database} from "../config/firebase";

// Fetch projects for a specific department
export const fetchProjects = (department) => {
  const [values, loading, error] = useCollection(collection(database, "projects"));
  const projects = values?.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((project) => project.department === department) || [];

  return { projects, loading, error };
};

// Fetch users for a specific department
export const fetchUsers = (department) => {
  const [values, loading, error] = useCollection(collection(database, "users"));
  const users = values?.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user) => Array.isArray(user.departments) && user.departments.includes(department)) || [];

  return { users, loading, error };
};

// Fetch departments
export const fetchDepartments = () => {
  const [values, loading, error] = useCollection(collection(database, "departments"));
  const departments = values?.docs.map((doc) => ({ id: doc.id, ...doc.data() })) || [];

  return { departments, loading, error };
};

// Fetch tasks for a specific project by projectId
export const fetchTasksForProject = async (projectId) => {
  try {
    // Get a reference to the project document using the projectId
    const projectRef = doc(database, "projects", projectId);

    // Reference to the "tasks" subcollection within the project document
    const tasksRef = collection(projectRef, "tasks");

    // Fetch the tasks from the tasks subcollection
    const querySnapshot = await getDocs(tasksRef);

    // Map the task documents to an array of task data
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() // Include task data (e.g., title, description)
    }));

    return { tasks, success: true };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: error.message, tasks: [] };
  }
};
