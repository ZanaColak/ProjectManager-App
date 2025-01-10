import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { fetchUsers, fetchDepartments } from "./services/dataService";
import { updateProject } from "./services/dataService";
import { database } from "./config/firebase";
import { Picker } from "@react-native-picker/picker";
import { showAlert } from './config/utill';


export default function ProjectDetails() {
    const { projectId } = useGlobalSearchParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { users: allUsers, loading: usersLoading, error: usersError } = fetchUsers();
    const [projects, setProjects] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const { departments, error: departmentError } = fetchDepartments();
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false); // New state to manage title edit mode
    const [newProjectTitle, setNewProjectTitle] = useState(""); // Store the new title input

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const projectRef = doc(database, "projects", projectId);
                const projectDoc = await getDoc(projectRef);
                if (projectDoc.exists()) {
                    setProject({ id: projectDoc.id, ...projectDoc.data() });
                    setNewProjectTitle(projectDoc.data().name); // Initialize newProjectTitle with the current title
                    if (projectDoc.data().teamMembers) {
                        setSelectedTeamMembers(projectDoc.data().teamMembers);
                    }
                } else {
                    setError("Projektet blev ikke fundet.");
                    showAlert("Fejl", "Projektet blev ikke fundet.");
                }
            } catch (error) {
                setError("Fejl ved indlæsning af projektoplysninger.");
                showAlert("Fejl", "Fejl ved indlæsning af projektoplysninger.");
                console.error("Fejl ved hentning af projektoplysninger:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [projectId]);

    const saveProjectDetails = async (field, value) => {
        try {
            const projectRef = doc(database, "projects", projectId);
            await updateDoc(projectRef, { [field]: value });
            console.log(`${field} opdateret i Firebase`);
        } catch (error) {
            showAlert("Fejl", `Fejl ved opdatering af ${field}: ${error.message}`);
            console.error(`Fejl ved opdatering af ${field}:`, error);
        }
    };

    const handleSaveTitle = () => {
        if (newProjectTitle !== project.name) {
            saveProjectDetails("name", newProjectTitle);
            setProject((prev) => ({ ...prev, name: newProjectTitle }));
        }
        setIsEditingTitle(false); // Exit edit mode
    };

    const handleSelectMember = (user) => {
        const updatedMembers = selectedTeamMembers.includes(user.id)
            ? selectedTeamMembers.filter((id) => id !== user.id)
            : [...selectedTeamMembers, user.id];

        setSelectedTeamMembers(updatedMembers);
        saveProjectDetails("teamMembers", updatedMembers);
    };

    if (loading || usersLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#173630" />
                <Text>Indlæser projektoplysninger...</Text>
            </View>
        );
    }

    if (error || usersError) {
        showAlert("Fejl", error || "Fejl ved indlæsning af brugere.");
        return <Text style={styles.errorText}>{error || "Fejl ved indlæsning af brugere."}</Text>;
    }

    const teamMembers = project.teamMembers
        ? allUsers.filter((user) => selectedTeamMembers.includes(user.id))
        : [];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.projectTitleContainer}>
                    {isEditingTitle ? (
                        <TextInput
                            style={styles.input}
                            value={newProjectTitle}
                            onChangeText={setNewProjectTitle}
                            onBlur={handleSaveTitle} // Save title when focus is lost
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditingTitle(true)}>
                            <Text style={styles.projectTitle}>{project.name}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                        router.push({
                            pathname: "/scrumBoard",
                            params: { projectId: project.id }
                        });
                    }}
                >
                    <Text style={styles.headerButtonText}>Gå til Scrum Board</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Beskrivelse:</Text>
            <TextInput
                style={styles.input}
                value={project.description}
                onChangeText={(text) => {
                    setProject((prev) => ({ ...prev, description: text }));
                    saveProjectDetails("description", text); // Update description in Firebase immediately
                }}
                multiline
                numberOfLines={4}
            />

            <View style={styles.detailContainer}>
                <Text style={styles.label}>Afdelinger:</Text>
                <ScrollView contentContainerStyle={styles.multiSelectContainer}>
                    {departments.map((dep) => (
                        <TouchableOpacity
                            key={dep.id}
                            style={project.departments && project.departments.includes(dep.name) ? styles.selectedDepartment : styles.unselectedDepartment}
                            onPress={() => {
                                const updatedDepartments = project.departments && project.departments.includes(dep.name)
                                    ? project.departments.filter((d) => d !== dep.name)
                                    : [...(project.departments || []), dep.name];

                                setProject((prev) => ({ ...prev, departments: updatedDepartments }));
                                saveProjectDetails("departments", updatedDepartments);  // Update departments in Firebase
                            }}
                        >
                            <Text style={styles.departmentText}>{dep.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Text style={styles.label}>Status:</Text>
            <Picker
                selectedValue={project.status}
                style={styles.input}
                onValueChange={(itemValue) => {
                    setProject((prev) => ({ ...prev, status: itemValue }));
                    saveProjectDetails("status", itemValue);  // Update status in Firebase immediately
                }}
            >
                <Picker.Item label="Ikke startet" value="not started" />
                <Picker.Item label="I gang" value="in progress" />
                <Picker.Item label="Færdig" value="done" />
            </Picker>

            <Text style={styles.label}>Prioritet:</Text>
            <Picker
                selectedValue={project.priority}
                style={styles.input}
                onValueChange={(itemValue) => {
                    setProject((prev) => ({ ...prev, priority: itemValue }));
                    saveProjectDetails("priority", itemValue);  // Update priority in Firebase immediately
                }}
            >
                <Picker.Item label="Lav" value="low" />
                <Picker.Item label="Middel" value="medium" />
                <Picker.Item label="Høj" value="high" />
            </Picker>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
    label: { fontSize: 16, fontWeight: "bold", marginTop: 10, color: "#333" },
    text: { fontSize: 16, color: "#555", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", marginBottom: 10 },
    input: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { color: "red", textAlign: "center", marginTop: 20 },
    teamMemberContainer: { marginBottom: 10 },
    backButton: {
        position: "absolute",
        top: 20,
        right: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: "#173630",
        borderRadius: 5
    },
    backButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 14
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    projectTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    projectTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
        textAlign: "center",
    },
    headerButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: "#173630",
        borderRadius: 5,
        position: "absolute",
        right: 0,
    },
    headerButtonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 14,
    },
    detailContainer: { marginBottom: 20 },
    multiSelectContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    unselectedDepartment: { padding: 10, margin: 5, backgroundColor: "#f1f1f1", borderRadius: 5 },
    selectedDepartment: { padding: 10, margin: 5, backgroundColor: "#a0e0c0", borderRadius: 5 },
    departmentText: { fontSize: 14, color: "#333" }
});
