import { addDoc, deleteDoc, updateDoc, doc, collection } from "firebase/firestore";
import { database } from "../config/firebase";
import { showAlert } from "../config/utill";
import {Alert} from "react-native";


export const createProject = async (projectData) => {
    try {
        const docRef = await addDoc(collection(database, "projects"), projectData);
        const projectId = docRef.id;
        showAlert("Succes", "Projekt oprettet.");
        return projectId;
    } catch (error) {
        showAlert("Fejl", "Kunne ikke oprette projekt.");
        console.error("Fejl ved oprettelse af projekt:", error);
        throw error;
    }
};


export const deleteProject = async (projectId) => {
    try {
        await deleteDoc(doc(database, "projects", projectId));
        showAlert("Succes", "Projekt slettet.");
    } catch (error) {
        showAlert("Fejl", "Kunne ikke slette projekt.");
        console.error("Fejl ved sletning af projekt:", error);
        throw error;
    }
};

const editProject = (project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setProjectDescription(project.description);
    setProjectDeadline(project.deadline); // Populate the deadline field
    setProjectPriority(project.priority); // Populate the priority field
    setShowAdminModal(true);
};

const updateProject = async () => {
    if (projectName && projectDescription && editingProject) {
        try {
            const projectRef = doc(database, "projects", editingProject.id);
            await updateDoc(projectRef, {
                name: projectName,
                description: projectDescription,
                deadline: projectDeadline, // Update deadline
                priority: projectPriority, // Update priority
                updatedAt: new Date(),
            });
            setEditingProject(null);
            setProjectName("");
            setProjectDescription("");
            setProjectDeadline(""); // Reset deadline after update
            setProjectPriority(""); // Reset priority
            setShowAdminModal(false);
        } catch (error) {
            Alert.alert("Error", "Failed to update project.");
            console.error("Error updating project:", error);
        }
    } else {
        Alert.alert("Error", "All fields must be filled.");
    }
};