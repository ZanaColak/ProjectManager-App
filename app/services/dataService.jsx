import {collection} from "firebase/firestore";
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

// Fetch tasks for a specific project
export const fetchTasks = async (projectId, query = '') => {
  try {
    // Reference to the tasks collection
    const tasksRef = collection(database, "tasks");

    // Query to fetch tasks related to the projectId
    const tasksQuery = query
        ? query(tasksRef)  // If you have a search query, apply it
        : query(tasksRef, where("projectId", "==", projectId));  // Only fetch tasks related to the projectId

    // Execute the query
    const querySnapshot = await getDocs(tasksQuery);

    // Map through the documents and return the data
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error("Error fetching tasks: " + error.message);
  }
};

// Function to add a task to a project
export const addTaskToProject = async (projectId, task) => {
  try {
    const tasksRef = collection(database, "projects", projectId, "tasks");
    const taskDocRef = await addDoc(tasksRef, task); // Automatically generates ID
    console.log("Task added successfully with ID: ", taskDocRef.id);
    return taskDocRef.id;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw new Error("Failed to add task.");
  }
};

const loadTasks = async () => {
  if (selectedProject) {
    // If fetchTasks expects projectId and query, make sure you pass them
    const tasks = await fetchTasks(selectedProject.id); // Pass only the projectId if query isn't required
    const updatedColumns = columns.map((column) => {
      const tasksForColumn = tasks.filter(
          (task) => task.columnId === column.id
      );
      return { ...column, tasks: tasksForColumn };
    });
    setColumns(updatedColumns);
  }
};
