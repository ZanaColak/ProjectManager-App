import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from "react-native";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { database } from "./config/firebase";
import { createTask } from "./task";
import { useGlobalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";

export default function ScrumBoard() {
    const { department } = useGlobalSearchParams();
    const [projects, setProjects] = useState([]);
    const [columns, setColumns] = useState([
        { id: "todo", name: "Backlog", tasks: [] },
        { id: "inprogress", name: "In Progress", tasks: [] },
        { id: "review", name: "Review", tasks: [] },
        { id: "done", name: "Done", tasks: [] },
        { id: "blocked", name: "Blocked", tasks: [] },
    ]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [modalVisible, setModalVisible] = useState(false);
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [updateTaskModalVisible, setUpdateTaskModalVisible] = useState(false); // for update modal
    const [taskToUpdate, setTaskToUpdate] = useState(null); // holds task to update
    const [errorMessage, setErrorMessage] = useState("");

    const projectQuery = collection(database, "projects");
    const [projectSnapshot, loadingProjects, errorProjects] = useCollection(projectQuery);

    const tasksQuery =
        selectedProject && collection(database, `projects/${selectedProject.id}/tasks`);
    const [taskSnapshot, loadingTasks, errorTasks] = useCollection(tasksQuery);

    useEffect(() => {
        if (projectSnapshot) {
            const projectList = projectSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(projectList);
            if (!selectedProject && projectList.length > 0) {
                setSelectedProject(projectList[0]);
            }
        }
        if (errorProjects) setErrorMessage("Error fetching projects.");
    }, [projectSnapshot]);

    useEffect(() => {
        if (taskSnapshot && selectedProject) {
            const taskList = taskSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const updatedColumns = columns.map((column) => ({
                ...column,
                tasks: taskList.filter((task) => task.column === column.id),
            }));
            setColumns(updatedColumns);
        }
        if (errorTasks) setErrorMessage("Error fetching tasks.");
    }, [taskSnapshot, selectedProject]);

    const addTask = async () => {
        if (!selectedProject || !newTaskTitle.trim() || !newTaskDescription.trim()) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        const newTask = {
            name: newTaskTitle,
            description: newTaskDescription,
            column: "todo",
            priority,
            projectId: selectedProject.id,
            createdAt: new Date(),
        };

        const { success, error } = await createTask(newTask);
        if (success) {
            setModalVisible(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
        } else {
            setErrorMessage(error);
        }
    };

    const addColumn = () => {
        const newColumn = {
            id: `new-${columns.length + 1}`,
            name: "New Column",
            tasks: [],
        };
        setColumns([...columns, newColumn]);
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setProjectModalVisible(false);
    };

    const handleUpdateTask = async () => {
        if (!taskToUpdate || !newTaskTitle.trim() || !newTaskDescription.trim()) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        const taskRef = doc(database, `projects/${selectedProject.id}/tasks`, taskToUpdate.id);
        await updateDoc(taskRef, {
            name: newTaskTitle,
            description: newTaskDescription,
            priority: priority,
        });

        // Clear and close modal
        setUpdateTaskModalVisible(false);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setTaskToUpdate(null);
    };

    const openUpdateModal = (task) => {
        setTaskToUpdate(task);
        setNewTaskTitle(task.name);
        setNewTaskDescription(task.description);
        setPriority(task.priority);
        setUpdateTaskModalVisible(true);
    };

    const handleDeleteTask = async () => {
        if (!taskToUpdate) return;

        try {
            const taskRef = doc(database, `projects/${selectedProject.id}/tasks`, taskToUpdate.id);
            await deleteDoc(taskRef); // Delete task from Firestore

            // Close modal and reset task to update
            setUpdateTaskModalVisible(false);
            setTaskToUpdate(null);
        } catch (error) {
            setErrorMessage("Error deleting task.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Scrumboard - {selectedProject ? selectedProject.name : "Select a project"}
            </Text>

            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>Create New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={addColumn}>
                <Text style={styles.buttonText}>Add Column</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setProjectModalVisible(true)}
            >
                <Text style={styles.buttonText}>Select Project</Text>
            </TouchableOpacity>

            <ScrollView
                horizontal={true}
                style={styles.board}
                contentContainerStyle={styles.boardContent}
            >
                {columns.map((column) => (
                    <View key={column.id} style={styles.column}>
                        <Text style={styles.columnHeader}>{column.name}</Text>
                        <FlatList
                            data={column.tasks}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.taskCard}
                                    onPress={() => openUpdateModal(item)} // Open update modal when clicking on task card
                                >
                                    <Text style={styles.taskName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                ))}
            </ScrollView>


            {/* Create Task Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <TextInput
                        placeholder="Task Title"
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Task Description"
                        value={newTaskDescription}
                        onChangeText={setNewTaskDescription}
                        style={styles.input}
                    />
                    <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
                        <Picker.Item label="Low" value="Low" />
                        <Picker.Item label="Medium" value="Medium" />
                        <Picker.Item label="High" value="High" />
                    </Picker>

                    {/* Create Task Button */}
                    <TouchableOpacity style={styles.button} onPress={addTask}>
                        <Text style={styles.buttonText}>Create Task</Text>
                    </TouchableOpacity>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => setModalVisible(false)} // Close modal when Cancel is pressed
                    >
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Update Task Modal */}
            <Modal visible={updateTaskModalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <TextInput
                        placeholder="Task Title"
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Task Description"
                        value={newTaskDescription}
                        onChangeText={setNewTaskDescription}
                        style={styles.input}
                    />
                    <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
                        <Picker.Item label="Low" value="Low" />
                        <Picker.Item label="Medium" value="Medium" />
                        <Picker.Item label="High" value="High" />
                    </Picker>

                    <TouchableOpacity style={styles.button} onPress={handleUpdateTask}>
                        <Text style={styles.buttonText}>Update Task</Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={handleDeleteTask} // Handle task deletion
                    >
                        <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => setUpdateTaskModalVisible(false)} // Close modal when Cancel is pressed
                    >
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal visible={projectModalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <FlatList
                        data={projects}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleProjectSelect(item)} style={styles.projectItem}>
                                <Text style={styles.projectText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ width: "100%" }} // Sørger for at FlatList-ens indhold fylder hele modalens bredde
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setProjectModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <View style={styles.bottomBox}>
                <Text style={styles.boxText}>
                    Copyright © 2024 Novozymes A/S, part of Novonesis Group
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#173630", // Header text color to match the button color
    },
    button: {
        backgroundColor: "#173630", // Dark green
        paddingVertical: 8,
        borderRadius: 4,
        width: "80%", // Ensure buttons have same width
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
    },
    modalContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        width: "90%", // Sikrer at modalens indhold ikke tager mere end 90% af skærmen
        maxWidth: 400, // Giver en maks bredde for at holde tingene konsistente på større skærme
        alignSelf: "center",
    },
    projectItem: {
        padding: 15,
        backgroundColor: "#f1f1f1",
        marginBottom: 10,
        borderRadius: 6,
        width: "100%", // Sørger for at elementerne fylder hele bredden af modalens indhold
    },
    input: {
        height: 40,
        borderColor: "#ddd",
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 8,
        width: "100%",
    },
    columnHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    taskCard: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 6,
        marginBottom: 10,
    },
    taskName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "#f8d7da",
    },
    cancelButtonText: {
        color: "#721c24",
    },
    deleteButton: {
        backgroundColor: "#dc3545",
    },
    deleteButtonText: {
        color: "#fff",
    },
    picker: {
        width: "100%",
        marginBottom: 15,
    },

    projectText: {
        fontSize: 16,
    },
    board: {
        flexDirection: "row",
        marginTop: 20,
    },
    column: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#e9ecef",
        borderRadius: 8,
        width: 250, // Fixed width for consistent scrolling
        marginRight: 10, // Adds spacing between columns
    },

    bottomBox: {
        width: "100%",
        height: 60,  // Reduced height of footer
        backgroundColor: "#173630",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
    },
    boxText: {
        color: "#fff",
        fontSize: 14,
        lineHeight: 16,
        textAlign: "center",
    },
});
