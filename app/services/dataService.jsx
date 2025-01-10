import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { database } from "../config/firebase";

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
export const fetchTasks = (projectId) => {
  const [values, loading, error] = useCollection(collection(database, `projects/${projectId}/tasks`));
  const tasks = values?.docs.map((doc) => ({ id: doc.id, ...doc.data() })) || [];

  return { tasks, loading, error };
};


