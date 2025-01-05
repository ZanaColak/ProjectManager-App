import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { fetchProjects } from "./services/dataService";
import { addDoc, deleteDoc, updateDoc, doc, collection } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { database } from "./config/firebase";

export default function Projects() {
    const { uid, department, role } = useGlobalSearchParams();
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [editingProject, setEditingProject] = useState(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const router = useRouter();

    const { projects, loading, error } = fetchProjects(department);

    const handleError = (message) => {
        router.push({ pathname: "/components/error", params: { message } });
    };

    const createProject = async () => {
        if (projectName && projectDescription) {
            try {
                await addDoc(collection(database, "projects"), {
                    name: projectName,
                    description: projectDescription,
                    owner: uid,
                    department,
                    createdAt: new Date(),
                });
                setProjectName("");
                setProjectDescription("");
                setShowAdminModal(false);
            } catch (error) {
                handleError("Failed to create project.");
                console.error("Error creating project:", error);
            }
        } else {
            Alert.alert("Error", "All fields must be filled.");
        }
    };

    const deleteProject = async (id) => {
        try {
            await deleteDoc(doc(database, "projects", id));
        } catch (error) {
            Alert.alert("Error", "Failed to delete project.");
            console.error("Error deleting project:", error);
        }
    };

    const editProject = (project) => {
        setEditingProject(project);
        setProjectName(project.name);
        setProjectDescription(project.description);
        setShowAdminModal(true);
    };

    const updateProject = async () => {
        if (projectName && projectDescription && editingProject) {
            try {
                const projectRef = doc(database, "projects", editingProject.id);
                await updateDoc(projectRef, {
                    name: projectName,
                    description: projectDescription,
                    updatedAt: new Date(),
                });
                setEditingProject(null);
                setProjectName("");
                setProjectDescription("");
                setShowAdminModal(false);
            } catch (error) {
                Alert.alert("Error", "Failed to update project.");
                console.error("Error updating project:", error);
            }
        } else {
            Alert.alert("Error", "All fields must be filled.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Projects - {department}</Text>

            {role === "admin" && (
                <TouchableOpacity style={styles.adminIcon} onPress={() => setShowAdminModal(true)}>
                    <Icon name="plus-circle" size={30} color="#173630" />
                </TouchableOpacity>
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#173630" />
                    <Text>Loading Projects...</Text>
                </View>
            )}

            {error && <Text style={styles.errorText}>Error loading projects.</Text>}

            <ScrollView style={styles.list}>
                {projects.map((project) => (
                    <View style={styles.projectItemContainer} key={project.id}>
                        <View style={styles.projectItem}>
                            <Text style={styles.projectText}>
                                {project.name.length > 30 ? `${project.name.substring(0, 30)}...` : project.name}
                                {project.description && project.description.length > 0 && (
                                    <Text style={styles.projectDescription}>
                                        {" "}
                                        -{" "}
                                        {project.description.length > 30
                                            ? `${project.description.substring(0, 30)}...`
                                            : project.description}
                                    </Text>
                                )}
                            </Text>
                        </View>

                        {role === "admin" && (
                            <>
                                <TouchableOpacity
                                    onPress={() => editProject(project)}
                                    style={styles.editButton}
                                >
                                    <Icon name="edit" size={24} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => deleteProject(project.id)}
                                    style={styles.deleteButton}
                                >
                                    <Icon name="trash" size={24} color="#000" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                ))}
            </ScrollView>

            {role === "admin" && (
                <Modal visible={showAdminModal} animationType="slide" transparent>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TextInput
                                style={styles.input}
                                placeholder="Project Name"
                                value={projectName}
                                onChangeText={setProjectName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Project Description"
                                value={projectDescription}
                                onChangeText={setProjectDescription}
                            />
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={editingProject ? updateProject : createProject}
                            >
                                <Text style={styles.addButtonText}>{editingProject ? "Update" : "Create"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowAdminModal(false);
                                    setEditingProject(null);
                                    setProjectName("");
                                    setProjectDescription("");
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    adminIcon: {
        alignSelf: "flex-end",
        marginRight: 20,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 20,
    },
    list: {
        flex: 1,
    },
    projectItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    projectItem: {
        flex: 1,
    },
    projectText: {
        fontSize: 16,
        color: "#173630",
    },
    projectDescription: {
        fontSize: 12,
        color: "#999",
    },
    editButton: {
        marginRight: 10,
    },
    deleteButton: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#ededed",
        color: "#000",
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#173630",
        borderRadius: 5,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#d9534f",
        borderRadius: 5,
    },
    cancelButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
