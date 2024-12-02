import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

export default function Scrumboard() {
    const [columns, setColumns] = useState([
        { id: "1", title: "BackLog", tasks: [] },
        { id: "2", title: "To Do", tasks: [] },
        { id: "3", title: "In Progress", tasks: [] },
        { id: "4", title: "Review", tasks: [] },
        { id: "5", title: "Done", tasks: [] },
    ]);
    const [newTask, setNewTask] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("Low");
    const [errorMessage, setErrorMessage] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false); // State for showing the DatePicker

    const addTask = () => {
        if (newTask.trim() === "") {
            setErrorMessage("Task name is required.");
            return;
        }

        if (dueDate.trim() === "" || !validateDate(dueDate)) {
            setErrorMessage("Valid due date is required.");
            return;
        }

        if (!["Low", "Medium", "High"].includes(priority)) {
            setErrorMessage("Priority must be Low, Medium, or High.");
            return;
        }

        setErrorMessage(""); // Clear any previous error messages

        const newTaskObj = {
            id: Date.now(),
            name: newTask,
            dueDate: dueDate,
            priority: priority,
        };

        setColumns((prevColumns) =>
            prevColumns.map((col) =>
                col.id === "1" // Default to adding new tasks to the Backlog
                    ? { ...col, tasks: [...col.tasks, newTaskObj] }
                    : col
            )
        );
        setNewTask("");
        setDueDate("");
        setPriority("Low");
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "Low":
                return "#8bc34a"; // Green for Low priority
            case "Medium":
                return "#ffeb3b"; // Yellow for Medium priority
            case "High":
                return "#f44336"; // Red for High priority
            default:
                return "#ffffff"; // Default to white
        }
    };

    const renderTask = ({ item: task }) => {
        return (
            <View style={styles.task}>
                <Text style={styles.taskText}>{task.name}</Text>
                <Text style={styles.taskDetails}>
                    Due: {task.dueDate} | Priority: {task.priority}
                </Text>
            </View>
        );
    };

    const renderColumn = ({ item }) => {
        return (
            <View style={styles.column}>
                <Text style={styles.columnTitle}>{item.title}</Text>
                <FlatList
                    data={item.tasks}
                    keyExtractor={(task) => task.id.toString()}
                    renderItem={renderTask}
                    contentContainerStyle={styles.columnTasks}
                />
            </View>
        );
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker(false);
        setDueDate(currentDate.toLocaleDateString()); // Format the date as needed
    };

    const handleDateInputChange = (text) => {
        setDueDate(text);
    };

    const validateDate = (date) => {
        // Simple validation to check if the date is in the format dd/mm/yyyy
        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        return dateRegex.test(date);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.departmentText}>Scrumboard</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a task or user story"
                    value={newTask}
                    onChangeText={setNewTask}
                />
                {errorMessage && newTask.trim() === "" && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Enter Due Date (dd/mm/yyyy)"
                    value={dueDate}
                    onChangeText={handleDateInputChange}
                />
                {errorMessage && !validateDate(dueDate) && (
                    <Text style={styles.errorText}>Please enter a valid date (dd/mm/yyyy)</Text>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Priority (Low, Medium, High)"
                    value={priority}
                    onChangeText={setPriority}
                />
                {errorMessage && !["Low", "Medium", "High"].includes(priority) && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                )}

                <TouchableOpacity style={styles.button} onPress={addTask}>
                    <Text style={styles.buttonText}>Add Task</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={columns}
                keyExtractor={(item) => item.id}
                horizontal
                renderItem={renderColumn}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
            />

            <View style={styles.bottomBox}>
                <Text style={styles.boxText}>Copyright © 2024 Novozymes A/S</Text>
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
        paddingHorizontal: 20,
        paddingTop: 80,
        marginBottom: 70,
    },
    departmentText: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    inputContainer: {
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 20,
    },
    input: {
        flex: 1,
        width: 300,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginVertical: 5,
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 15,
        backgroundColor: "#173630",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    column: {
        backgroundColor: "#fff",
        padding: 10,
        marginRight: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        width: 250,
    },
    columnTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    task: {
        backgroundColor: "#e9ecef",
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    taskText: {
        fontSize: 14,
    },
    taskDetails: {
        fontSize: 12,
        color: "#666",
    },
    columnTasks: {
        marginTop: 10,
    },
    bottomBox: {
        width: "100%",
        height: 70,
        backgroundColor: "#173630",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
    },
    boxText: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 18,
        textAlign: "center",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
    },
});
