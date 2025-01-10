import React, { useState, useEffect } from "react";
import {StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal } from "react-native";
import { collection } from "firebase/firestore";
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
                                <View style={styles.taskCard}>
                                    <Text style={styles.taskName}>{item.name}</Text>
                                </View>
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                ))}
            </View>
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
                    <Picker selectedValue={priority} onValueChange={setPriority}>
                        <Picker.Item label="Low" value="Low" />
                        <Picker.Item label="Medium" value="Medium" />
                        <Picker.Item label="High" value="High" />
                    </Picker>
                    <TouchableOpacity style={styles.button} onPress={addTask}>
                        <Text style={styles.buttonText}>Create Task</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={projectModalVisible} animationType="slide">
                <FlatList
                    data={projects}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleProjectSelect(item)}>
                            <Text>{item.name}</Text>
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
    deleteButton: {
        backgroundColor: "red",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 12,
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
    columnTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
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
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        width: "100%",
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
