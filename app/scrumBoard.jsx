import React, { useState, useEffect} from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, TouchableWithoutFeedback } from "react-native";
import { collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { database } from "./config/firebase";
import { createTask } from "./task";
import { useGlobalSearchParams } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { Keyboard } from 'react-native';


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
    const [updateTaskModalVisible, setUpdateTaskModalVisible] = useState(false);
    const [taskToUpdate, setTaskToUpdate] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [timeSpent, setTimeSpent] = useState("");
    const [editingColumn, setEditingColumn] = useState(null); // Holder styr på hvilken kolonne der er ved at blive redigeret
    const [newColumnName, setNewColumnName] = useState(""); // Holder det nye kolonnenavn


    const projectQuery = collection(database, "projects");
    const [projectSnapshot, loadingProjects, errorProjects] = useCollection(projectQuery);

    const tasksQuery = selectedProject && collection(database, `projects/${selectedProject.id}/tasks`);
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

    const handleColumnHeaderClick = (column) => {
        setEditingColumn(column.id); // Angiver den kolonne der skal redigeres
        setNewColumnName(column.name); // Sætter kolonnens nuværende navn som standard værdi i inputfeltet
    };

    const handleColumnNameChange = () => {
        const updatedColumns = columns.map((column) => {
            if (column.id === editingColumn) {
                return { ...column, name: newColumnName };
            }
            return column;
        });
        setColumns(updatedColumns); // Opdaterer kolonnerne med det nye navn
        setEditingColumn(null); // Lukker redigeringsfeltet
    };


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
            timeSpent,
            projectId: selectedProject.id,
            createdAt: new Date(),
        };

        const { success, error } = await createTask(newTask);
        if (success) {
            setModalVisible(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setTimeSpent(""); // Reset the timeSpent input
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

    const getTaskCardBackgroundColor = (priority) => {
        switch(priority) {
            case "Low":
                return "lightgreen";  // Green for low priority
            case "Medium":
                return "lightyellow"; // Yellow for medium priority
            case "High":
                return "lightcoral";  // Red for high priority
            default:
                return "white";       // Default color if no priority
        }
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
            column: taskToUpdate.column,

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

            <TouchableOpacity style={styles.button} onPress={() => setProjectModalVisible(true)}>
                <Text style={styles.buttonText}>Select Project</Text>
            </TouchableOpacity>

            {/* Scrollable board for columns */}
            <ScrollView horizontal={true} style={styles.board} contentContainerStyle={styles.boardContent}>
                {columns.map((column) => (
                    <TouchableWithoutFeedback
                        key={column.id}
                        onPress={() => {
                            if (editingColumn !== null) {
                                setEditingColumn(null); // Close editing mode if clicking outside
                                Keyboard.dismiss(); // Hide the keyboard
                            }
                        }}
                    >
                        <View style={styles.column}>
                            {editingColumn === column.id ? (
                                <TextInput
                                    value={newColumnName}
                                    onChangeText={setNewColumnName}
                                    style={styles.input}
                                    onSubmitEditing={handleColumnNameChange}
                                />
                            ) : (
                                <TouchableOpacity onPress={() => handleColumnHeaderClick(column)}>
                                    <Text style={styles.columnHeader}>{column.name}</Text>
                                </TouchableOpacity>
                            )}
                            <FlatList
                                data={column.tasks}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.taskCard, { backgroundColor: getTaskCardBackgroundColor(item.priority) }]}
                                        onPress={() => openUpdateModal(item)} // Open update modal when clicking on task card
                                    >
                                        <Text style={styles.taskName}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.id}
                            />
                        </View>
                    </TouchableWithoutFeedback>
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


                    <TextInput
                        placeholder="Time Spent (e.g., '1 hour', '30 minutes')"
                        value={timeSpent}
                        onChangeText={setTimeSpent}
                        style={styles.input}
                    />
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
                    <Picker
                        selectedValue={priority}
                        onValueChange={setPriority}
                        style={[styles.picker]}
                    >
                        <Picker.Item label="Low" value="Low" style={{ color: 'green' }} />
                        <Picker.Item label="Medium" value="Medium" style={{ color: 'orange' }} />
                        <Picker.Item label="High" value="High" style={{ color: 'red' }} />
                    </Picker>

                    {/* Picker for selecting the column */}
                    <Picker
                        selectedValue={taskToUpdate ? taskToUpdate.column : "todo"}
                        onValueChange={(newColumn) => setTaskToUpdate({ ...taskToUpdate, column: newColumn })}
                        style={[styles.picker]}
                    >
                        <Picker.Item label="Backlog" value="todo" />
                        <Picker.Item label="In Progress" value="inprogress" />
                        <Picker.Item label="Review" value="review" />
                        <Picker.Item label="Done" value="done" />
                        <Picker.Item label="Blocked" value="blocked" />
                    </Picker>

                    <TextInput
                        placeholder="Time Spent (e.g., '1 hour', '30 minutes')"
                        value={timeSpent}
                        onChangeText={setTimeSpent}
                        style={styles.input}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleUpdateTask}>
                        <Text style={styles.buttonText}>Update Task</Text>
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[styles.button, styles.deleteButton]}
                        onPress={handleDeleteTask}
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

            {/* Project Selection Modal */}
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
        width: "90%", // Ensure modal content does not exceed screen width
        maxWidth: 400, // Provide a max width to keep the modal consistent on larger screens
        borderRadius: 10,
    },

    picker: {
        width: "100%",
        height: 50,
        marginVertical: 8,
    },
    board: {
        flexDirection: "row",
        marginTop: 20,
    },
    boardContent: {
        flexDirection: "row",
    },
    column: {
        width: 250,
        marginRight: 15,
    },
    taskCard: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
        padding: 10,
        borderRadius: 4,
    },
    taskName: {
        fontSize: 16,
    },
    projectItem: {
        padding: 15,
    },
    projectText: {
        fontSize: 18,
    },
    cancelButton: {
        backgroundColor: "#f8f9fa",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    cancelButtonText: {
        color: "#173630",
    },
    deleteButton: {
        backgroundColor: "#e74c3c",
    },
    deleteButtonText: {
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        width: "100%",
        marginVertical: 8,
        borderRadius: 4,
    },
    columnHeader: {
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
        fontSize: 18,
        color: "#173630",
    },

    bottomBox: {
        width: "100%",
        height: 60,
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
