import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import Timeline from "react-native-timeline-flatlist";
import { database } from "./config/firebase";

export default function TimelineScreen() {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const projectQuery = collection(database, "projects");
    const [projectSnapshot] = useCollection(projectQuery);

    useEffect(() => {
        const fetchAllProjectsAndTasks = async () => {
            if (projectSnapshot) {
                let allProjects = [];
                let allTasks = [];
                const projectList = projectSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProjects(projectList);

                for (let project of projectList) {
                    const taskQuery = collection(database, `projects/${project.id}/tasks`);
                    const taskSnapshot = await getDocs(taskQuery);
                    const projectTasks = taskSnapshot.docs.map((doc) => {
                        const taskData = doc.data();
                        return {
                            id: doc.id,
                            title: taskData.name,
                            description: `Project: ${project.name}`,
                            time: taskData.startDate ? new Date(taskData.startDate).toLocaleDateString() : "No Start Date",
                            status: taskData.status,  // Ensure status is captured here
                            priority: taskData.priority, // Ensure priority is captured
                            ...taskData,
                            projectId: project.id,
                        };
                    });
                    allTasks = [...allTasks, ...projectTasks];
                }

                // Sort tasks by start date (valid dates only)
                allTasks.sort((a, b) => {
                    const dateA = new Date(a.startDate);
                    const dateB = new Date(b.startDate);
                    return dateA - dateB;
                });

                setTasks(allTasks);

                // Set default project to the first in the list
                if (projectList.length > 0) {
                    setSelectedProject(projectList[0].id);
                }
            }
        };

        fetchAllProjectsAndTasks();
    }, [projectSnapshot]);

    // Filter tasks by selected project
    const filteredTasks = tasks.filter(task => task.projectId === selectedProject);

    // Define color schemes based on status and priority
    const getTaskColor = (status, priority) => {
        // Status colors
        const statusColors = {
            "To Do": "#808080",  // Grey for To Do
            "In Progress": "#FFA500", // Orange for In Progress
            "Done": "#008000",  // Green for Done
        };

        // Priority colors
        const priorityColors = {
            "Low": "#28a745",  // Green for low priority
            "Medium": "#ffc107",  // Yellow for medium priority
            "High": "#dc3545",  // Red for high priority
        };

        // Default color
        let color = "#000";  // Default color

        if (status && statusColors[status]) {
            color = statusColors[status];  // Override with status color
        }

        if (priority && priorityColors[priority]) {
            color = priorityColors[priority];  // Override with priority color
        }

        return color;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Project Timeline</Text>
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

            <Picker
                selectedValue={selectedProject}
                onValueChange={(itemValue) => setSelectedProject(itemValue)}
                style={styles.picker}
            >
                {projects.map((project) => (
                    <Picker.Item key={project.id} label={project.name} value={project.id} />
                ))}
            </Picker>

            <Timeline
                data={filteredTasks}
                circleSize={20}
                // Dynamically set circle color based on status and priority
                circleColor={(item) => getTaskColor(item.status, item.priority)}
                lineColor="rgba(0,0,0,0.5)"
                timeContainerStyle={{ minWidth: 72, marginTop: 0 }}
                timeStyle={{
                    textAlign: "center",
                    backgroundColor: "#ff9797",
                    color: "white",
                    padding: 5,
                    borderRadius: 13,
                }}
                descriptionStyle={{ color: "gray" }}
                options={{
                    style: { paddingTop: 5 },
                }}
                innerCircle={"dot"}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f9fa",
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#173630",
        textAlign: "center",
    },
    picker: {
        height: 50,
        width: "100%",
        marginBottom: 20,
    },
    errorMessage: {
        color: "red",
        fontSize: 14,
        marginBottom: 10,
        textAlign: "center",
    },
});
