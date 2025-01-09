import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { fetchTasks } from "./services/dataService";
import { addDoc, deleteDoc, updateDoc, doc, collection } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { database } from "./config/firebase";

export const createTask = async (newTask) => {
    if (newTask && newTask.projectId && newTask.name && newTask.description) {
        try {
            // Reference to the specific project document
            const projectRef = doc(database, "projects", newTask.projectId);

            // Reference to the "tasks" subcollection within the project document
            const tasksRef = collection(projectRef, "tasks");

            // Add the new task to the "tasks" subcollection
            const docRef = await addDoc(tasksRef, {
                name: newTask.name,
                description: newTask.description,
                projectId: newTask.projectId,
                column: "todo",
                status: "Not Started",
                priority: newTask.priority,
                createdAt: new Date(),
            });

            console.log("Task created with ID:", docRef.id);
            return { success: true, taskId: docRef.id };
        } catch (error) {
            console.error("Error creating task:", error.message);
            return { success: false, error: error.message || "Internal Server Error" };
        }
    } else {
        return { success: false, error: "Missing required task data" };
    }
};


export default function Tasks() {
    const { uid, projectId, role } = useGlobalSearchParams();
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskDeadline, setTaskDeadline] = useState("");
    const [taskPriority, setTaskPriority] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const router = useRouter();

    const { tasks, loading, error } = fetchTasks(projectId);

    const handleError = (message) => {
        router.push({ pathname: "/components/error", params: { message } });
    };
    const viewTaskDetails = (task) => {
        router.push({
            pathname: "/taskDetails",
            params: { taskId: task.id, taskName: task.name }
        });
    };


    const deleteTask = async (id) => {
        try {
            await deleteDoc(doc(database, "tasks", id));
        } catch (error) {
            Alert.alert("Error", "Failed to delete task.");
            console.error("Error deleting task:", error);
        }
    };

    const editTask = (task) => {
        setEditingTask(task);
        setTaskName(task.name);
        setTaskDescription(task.description);
        setTaskDeadline(task.deadline);
        setTaskPriority(task.priority);
        setShowAdminModal(true);
    };

    const updateTask = async () => {
        if (taskName && taskDescription && editingTask) {
            try {
                const taskRef = doc(database, "tasks", editingTask.id);
                await updateDoc(taskRef, {
                    name: taskName,
                    description: taskDescription,
                    deadline: taskDeadline,
                    priority: taskPriority,
                    updatedAt: new Date(),
                });
                setEditingTask(null);
                setTaskName("");
                setTaskDescription("");
                setTaskDeadline("");
                setTaskPriority("");
                setShowAdminModal(false);
            } catch (error) {
                Alert.alert("Error", "Failed to update task.");
                console.error("Error updating task:", error);
            }
        } else {
            Alert.alert("Error", "All fields must be filled.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tasks - {projectId}</Text>

            {role === "admin" && (
                <TouchableOpacity style={styles.adminIcon} onPress={() => setShowAdminModal(true)}>
                    <Icon name="plus-circle" size={30} color="#173630" />
                </TouchableOpacity>
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#173630" />
                    <Text>Loading Tasks...</Text>
                </View>
            )}

            {error && <Text style={styles.errorText}>Error loading tasks.</Text>}

            <ScrollView style={styles.list}>
                {tasks.map((task) => (
                    <View style={styles.taskItemContainer} key={task.id}>
                        <TouchableOpacity onPress={() => viewTaskDetails(task)}>
                            <View style={styles.taskItem}>
                                <Text style={styles.taskText}>
                                    {task.name.length > 30 ? `${task.name.substring(0, 30)}...` : task.name}
                                    {task.description && task.description.length > 0 && (
                                        <Text style={styles.taskDescription}>
                                            {" "}-{" "}
                                            {task.description.length > 30
                                                ? `${task.description.substring(0, 30)}...`
                                                : task.description}
                                        </Text>
                                    )}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {role === "admin" && (
                            <>
                                <TouchableOpacity
                                    onPress={() => editTask(task)}
                                    style={styles.editButton}
                                >
                                    <Icon name="edit" size={24} color="#000" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => deleteTask(task.id)}
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
                                placeholder="Task Name"
                                value={taskName}
                                onChangeText={setTaskName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Task Description"
                                value={taskDescription}
                                onChangeText={setTaskDescription}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Task Deadline"
                                value={taskDeadline}
                                onChangeText={setTaskDeadline}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Priority (Low, Medium, High)"
                                value={taskPriority}
                                onChangeText={setTaskPriority}
                            />

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={editingTask ? updateTask : createTask}
                            >
                                <Text style={styles.addButtonText}>{editingTask ? "Update" : "Create"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setShowAdminModal(false);
                                    setEditingTask(null);
                                    setTaskName("");
                                    setTaskDescription("");
                                    setTaskDeadline("");
                                    setTaskPriority("");
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
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
    taskItemContainer: {
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
    taskItem: {
        flex: 1,
    },
    taskText: {
        fontSize: 16,
        color: "#173630",
    },
    taskDescription: {
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
