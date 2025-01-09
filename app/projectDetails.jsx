import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { fetchUsers } from "./services/dataService";
import { database } from "./config/firebase";

export default function ProjectDetails() {
    const { projectId } = useGlobalSearchParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { users: allUsers, loading: usersLoading, error: usersError } = fetchUsers();

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const projectRef = doc(database, "projects", projectId);
                const projectDoc = await getDoc(projectRef);
                if (projectDoc.exists()) {
                    setProject({ id: projectDoc.id, ...projectDoc.data() });
                } else {
                    setError("Project not found.");
                }
            } catch (error) {
                setError("Failed to load project details.");
                console.error("Error fetching project details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjectDetails();
    }, [projectId]);

    if (loading || usersLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#173630" />
                <Text>Loading Project Details...</Text>
            </View>
        );
    }

    if (error || usersError) {
        return <Text style={styles.errorText}>{error || "Error loading users."}</Text>;
    }

    // Filter the users based on the team members in the project
    const teamMembers = project.teamMembers
        ? allUsers.filter(user => project.teamMembers.includes(user.id))
        : [];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/projects")}>
                    <Text style={styles.backButtonText}>Back to Projects</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("/scrumBoard")}>
                    <Text style={styles.backButtonText}>Go to Scrum board</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.header}>{project.name}</Text>
            <Text style={styles.description}>{project.description}</Text>

            <Text style={styles.label}>Department:</Text>
            <Text style={styles.text}>{project.department}</Text>

            <Text style={styles.label}>Deadline:</Text>
            <Text style={styles.text}>{new Date(project.deadline).toLocaleDateString()}</Text>

            <Text style={styles.label}>Status:</Text>
            <Text style={styles.text}>{project.status}</Text>

            <Text style={styles.label}>Priority:</Text>
            <Text style={styles.text}>{project.priority}</Text>

            <Text style={styles.label}>Budget:</Text>
            <Text style={styles.text}>${project.budget}</Text>

            <Text style={styles.label}>Team Members:</Text>
            {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                    <View key={member.id} style={styles.teamMemberContainer}>
                        {/* Display member's full name */}
                        <Text style={styles.text}>{`${member.firstName || "Unknown"} ${member.lastName || "Unknown"}`}</Text>
                        <Text style={styles.text}>{member.email}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.text}>No team members assigned.</Text>
            )}


        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    description: { fontSize: 16, color: "#555", marginBottom: 20 },
    label: { fontSize: 16, fontWeight: "bold", marginTop: 10, color: "#333" },
    text: { fontSize: 16, color: "#555", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", marginBottom: 10 },
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
        fontSize: 14 // Reduce the font size to make the button text smaller
    }
});

