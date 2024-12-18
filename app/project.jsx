import React, {useState, useEffect} from "react";
import {View, Text, TextInput, StyleSheet, Button, Alert, FlatList, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard} from "react-native";
import {useGlobalSearchParams} from "expo-router";
import {database} from "./config/firebase";
import {collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where} from "firebase/firestore";

export default function Project() {
    const {uid, department} = useGlobalSearchParams();
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [editingProject, setEditingProject] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);

    // Fetch projects that belong to the current department
    useEffect(() => {
        const q = query(
            collection(database, "projects"),
            where("owner", "==", uid),
            where("department", "==", department)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedProjects = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(fetchedProjects);
        });

        return () => unsubscribe();
    }, [uid, department]);

    const createProject = async () => {
        if (newProjectName && newProjectDescription) {
            try {
                await addDoc(collection(database, "projects"), {
                    name: newProjectName,
                    description: newProjectDescription,
                    owner: uid,
                    department,
                    createdAt: new Date(),
                });
                setNewProjectName("");
                setNewProjectDescription("");
            } catch (error) {
                Alert.alert("Fejl", "Oprettelse projekt mislykkes. Prøv igen.");
                console.error("Error creating project:", error);
            }
        } else {
            Alert.alert("Fejl", "Alle felter skal udfyldes.");
        }
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setNewProjectName(project.name);
        setNewProjectDescription(project.description);
    };

    const handleUpdateProject = async () => {
        if (newProjectName && newProjectDescription) {
            try {
                const projectRef = doc(database, "projects", editingProject.id);
                await updateDoc(projectRef, {
                    name: newProjectName,
                    description: newProjectDescription,
                    updatedAt: new Date(),
                });
                setEditingProject(null);
                setNewProjectName("");
                setNewProjectDescription("");
            } catch (error) {
                Alert.alert("Error", "Failed to update project. Try again.");
                console.error("Error updating project:", error);
            }
        } else {
            Alert.alert("Fejl", "Alle felter skal udfyldes.");
        }
    };

    const handleDeleteProject = async (projectId) => {
        try {
            const projectRef = doc(database, "projects", projectId);
            await deleteDoc(projectRef);
        } catch (error) {
            Alert.alert("Error", "Failed to delete project. Try again.");
            console.error("Error deleting project:", error);
        }
    };

    const openProjectDescription = (project) => {
        setSelectedProject(project);
    };

    const closeModal = () => {
        setSelectedProject(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Projekter - {department}</Text>

            <TextInput
                style={styles.input}
                placeholder="Projekt Navn"
                value={newProjectName}
                onChangeText={setNewProjectName}
            />
            <TextInput
                style={styles.input}
                placeholder="Projekt Beskrivelse"
                value={newProjectDescription}
                onChangeText={setNewProjectDescription}
            />

            {editingProject ? (
                <Button
                    title="Opdater Projekt"
                    onPress={handleUpdateProject}
                    color="#173630"
                />
            ) : (
                <Button
                    title="Opret Projekt"
                    onPress={createProject}
                    color="#173630"
                />
            )}

            <FlatList
                data={projects}
                renderItem={({item}) => (
                    <View style={styles.projectItem}>
                        <TouchableOpacity onPress={() => openProjectDescription(item)}>
                            <Text style={styles.projectTitle}>{item.name}</Text>
                        </TouchableOpacity>
                        <View style={styles.projectActions}>
                            <TouchableOpacity onPress={() => handleEditProject(item)}>
                                <Text style={styles.actionText}>Rediger</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteProject(item.id)}>
                                <Text style={styles.actionText}>Slet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />

            {selectedProject && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={!!selectedProject}
                    onRequestClose={closeModal}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Beskrivelse</Text>
                                <Text style={styles.modalDescription}>
                                    {selectedProject.description}
                                </Text>
                                <Button title="Luk" onPress={closeModal} color="#173630"/>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
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
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#ededed",
        color: "#000000",
    },
    projectItem: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: "#fff",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#173630",
    },
    projectActions: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionText: {
        color: "#173630",
        fontWeight: "bold",
        marginHorizontal: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        width: "80%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        color: "#555",
        marginBottom: 8,
        textAlign: "center",
    },
});
