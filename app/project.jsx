import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { fetchProjects } from "./services/dataService";
import { createProject, deleteProject } from "./services/projectService";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Projects() {
    const { department, role } = useGlobalSearchParams();
    const router = useRouter();
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectDeadline, setProjectDeadline] = useState("");
    const [projectPriority, setProjectPriority] = useState("");
    const { projects, loading, error } = fetchProjects(department);

    const handleCreateProject = async () => {
        const projectData = {
            name: projectName,
            description: projectDescription,
            deadline: projectDeadline,
            priority: projectPriority,
            department,
        };

        await createProject(projectData, () => {
            setProjectName("");
            setProjectDescription("");
            setProjectDeadline("");
            setProjectPriority("");
            setShowCreationModal(false);
        });
    };

    const handleDeleteProject = async (id) => {
        await deleteProject(id);
    };

    const navigateToDetails = (project) => {
        router.push({
            pathname: "/projectDetails",
            params: { projectId: project.id, projectName: project.name },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Projekter - {department}</Text>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#173630" />
                    <Text>Indlæser projekter...</Text>
                </View>
            )}

            {error && <Text style={styles.errorText}>Fejl ved indlæsning af projekter.</Text>}

            <ScrollView style={styles.list}>
                {projects.map((project) => (
                    <TouchableOpacity
                        key={project.id}
                        onPress={() => navigateToDetails(project)}
                        style={styles.projectItemContainer}
                    >
                        <View style={styles.projectItem}>
                            <Text style={styles.projectText}>{project.name}</Text>
                            <Text style={styles.projectDescription}>{project.description}</Text>
                        </View>
                        {role === "admin" && (
                            <TouchableOpacity onPress={() => handleDeleteProject(project.id)} style={styles.deleteButton}>
                                <Icon name="trash" size={24} color="#000" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {role === "admin" && (
                <TouchableOpacity style={styles.addIcon} onPress={() => setShowCreationModal(true)}>
                    <Icon name="plus-circle" size={50} color="#173630" />
                </TouchableOpacity>
            )}

            <Modal visible={showCreationModal} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="Projekt Navn"
                                placeholderTextColor="#999"
                                value={projectName}
                                onChangeText={setProjectName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Projekt Beskrivelse"
                                placeholderTextColor="#999"
                                value={projectDescription}
                                onChangeText={setProjectDescription}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Projekt Deadline"
                                placeholderTextColor="#999"
                                value={projectDeadline}
                                onChangeText={setProjectDeadline}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Prioritet (Lav, Medium, Høj)"
                                placeholderTextColor="#999"
                                value={projectPriority}
                                onChangeText={setProjectPriority}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={handleCreateProject}>
                                <Text style={styles.addButtonText}>Opret</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowCreationModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Annuller</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 70 : 80,
    },
    header: {
        fontSize: Platform.OS === "ios" ? 28 : 26,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#173630",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#d9534f",
        textAlign: "center",
        marginBottom: 20,
        fontSize: 16,
    },
    list: {
        flex: 1,
        marginTop: Platform.OS === "web" ? 10 : 15,
    },
    projectItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    projectItem: {
        flex: 1,
    },
    projectText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#173630",
    },
    projectDescription: {
        fontSize: 12,
        color: "#999",
    },
    deleteButton: {
        marginLeft: 10,
    },
    addIcon: {
        position: "absolute",
        bottom: 30,
        right: 30,
        shadowColor: Platform.OS === "ios" ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: Platform.OS === "ios" ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: Platform.OS === "web" ? 3 : 6,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Platform.OS === "ios" ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: Platform.OS === "ios" ? "85%" : "90%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    input: {
        width: "100%",
        padding: 14,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#f5f5f5",
        color: "#333",
        fontSize: 16,
        borderColor: "#ccc",
    },
    addButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: "#173630",
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    addButtonText: {
        color: "#fff",
        fontSize: Platform.OS === "ios" ? 16 : 15,
        fontWeight: "bold",
    },
    cancelButton: {
        marginTop: 15,
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: "#d9534f",
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontSize: Platform.OS === "ios" ? 16 : 15,
        fontWeight: "bold",
    },
});

