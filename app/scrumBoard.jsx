import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal } from "react-native";
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

            <View style={styles.board}>
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
            </View>

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
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setProjectModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
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
    },
    button: {
        backgroundColor: "#173630",
        paddingVertical: 8,
        borderRadius: 4,
        width: "60%",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 14,
    },
    errorText: {
        color: "red",
        fontSize: 12,
    },
    board: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
    },
    column: {
        width: "18%",
        marginHorizontal: 5,
    },
    columnHeader: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    taskCard: {
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
        backgroundColor: "#4CAF50",
    },
    taskName: {
        fontSize: 14,
        color: "#fff",
    },
    modalContent: {
        flex: 1,
        padding: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        width: "100%",
    },
    cancelButton: {
        backgroundColor: "red",
    },
    cancelButtonText: {
        color: "white",
    },
    deleteButton: {
        backgroundColor: "red",
        marginTop: 10, // Optional, to add space between buttons
    },
    deleteButtonText: {
        color: "white",
        textAlign: "center",
    },

});
