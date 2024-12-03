import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Modal, Picker } from "react-native";

export default function Scrumboard() {
    const [columns, setColumns] = useState([
        { id: "todo", name: "Backlog", tasks: [] },
        { id: "inprogress", name: "Igangværende", tasks: [] },
        { id: "review", name: "Anmeldelse", tasks: [] },
        { id: "done", name: "Færdig", tasks: [] },
        { id: "blocked", name: "Blokeret", tasks: [] },
    ]);

    const [newTask, setNewTask] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("low");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedColumn, setSelectedColumn] = useState("todo");
    const [members, setMembers] = useState("");

    // Validate time inputs
    const validateTime = (start, end) => {
        const startDate = new Date(`1970-01-01T${start}`);
        const endDate = new Date(`1970-01-01T${end}`);
        const duration = (endDate - startDate) / 1000 / 60;

        if (isNaN(startDate) || isNaN(endDate)) return "Start- og sluttid er påkrævet.";
        if (startDate >= endDate) return "Starttid skal være tidligere end sluttid.";
        if (duration <= 0 || duration > 24 * 60) return "Total tid skal være positiv og mindre end 24 timer.";
        return "";
    };

    const addTaskToBacklog = () => {
        if (newTask.trim() === "") {
            setErrorMessage("Opgavenavn er påkrævet.");
            return;
        }

        // Check if task already exists in any column
        const taskExists = columns.some(column =>
            column.tasks.some(task => task.name === newTask.trim())
        );

        if (taskExists) {
            setErrorMessage("Opgave med dette navn eksisterer allerede.");
            return;
        }

        // Add task only to the "Backlog" (todo column)
        const updatedColumns = columns.map((column) =>
            column.id === "todo"
                ? {
                    ...column,
                    tasks: [
                        ...column.tasks,
                        {
                            id: Date.now().toString(),
                            name: newTask,
                            priority: "low",  // Default priority
                            columnId: "todo", // Add the column ID to track where the task is
                        },
                    ],
                }
                : column
        );

        setColumns(updatedColumns);
        setErrorMessage("");
        setNewTask("");  // Reset the task name input field
    };

    // When saving task details after selecting a column
    const saveTaskDetails = () => {
        const timeError = validateTime(startTime, endTime);
        if (timeError) {
            setErrorMessage(timeError);
            return;
        }

        // Remove task from the current column
        const updatedColumns = columns.map((column) => {
            if (column.id === selectedTask.columnId) {
                return {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== selectedTask.id),
                };
            }
            return column;
        });

        // Add task to the new selected column
        const updatedColumnsWithNewColumn = updatedColumns.map((column) =>
            column.id === selectedColumn
                ? {
                    ...column,
                    tasks: [
                        ...column.tasks,
                        {
                            ...selectedTask,
                            dueDate,
                            priority,
                            startTime,
                            endTime,
                            members,
                            columnId: selectedColumn, // Update columnId when moving the task
                        },
                    ],
                }
                : column
        );

        setColumns(updatedColumnsWithNewColumn);
        setModalVisible(false);
        setSelectedTask(null);
        setMembers(""); // Reset members input field
    };

    const deleteTask = () => {
        const updatedColumns = columns.map((column) =>
            column.id === selectedTask.columnId
                ? {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== selectedTask.id),
                }
                : column
        );

        setColumns(updatedColumns);
        setModalVisible(false); // Luk modal
        setSelectedTask(null); // Nulstil valgte opgave
    };


    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    const getPriorityColor = (priority) => {
        if (!priority || typeof priority !== 'string') {
            return "#D3D3D3"; // Default gray if priority is undefined or not a string
        }

        switch (priority.toLowerCase()) {
            case "high":
                return "#FF6347"; // Red
            case "medium":
                return "#FFD700"; // Yellow
            case "low":
                return "#32CD32"; // Green
            default:
                return "#D3D3D3"; // Default gray if no recognized priority
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Scrumboard</Text>

            {/* Task creation form */}
            <View style={styles.addTaskContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Opgavenavn"
                    value={newTask}
                    onChangeText={setNewTask}
                />
                {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                <TouchableOpacity style={styles.button} onPress={addTaskToBacklog}>
                    <Text style={styles.buttonText}>Tilføj opgave</Text>
                </TouchableOpacity>
            </View>

            {/* Columns */}
            <View style={styles.board}>
                {columns.map((column) => (
                    <View key={column.id} style={styles.column}>
                        <Text style={styles.columnHeader}>{column.name}</Text>

                        <FlatList
                            data={column.tasks}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => openTaskDetails(item)}>
                                    <View style={[styles.taskCard, { backgroundColor: getPriorityColor(item.priority) }]} >
                                        <Text style={styles.taskName}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                ))}
            </View>

            {/* Task details modal */}
            {selectedTask && (
                <Modal visible={modalVisible} animationType="slide">
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{selectedTask.name}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Forfaldsdato (YYYY-MM-DD)"
                            value={dueDate}
                            onChangeText={setDueDate}
                        />
                        {/* Priority selection */}
                        <Picker
                            selectedValue={priority}
                            style={styles.input}
                            onValueChange={(itemValue) => setPriority(itemValue)}
                        >
                            <Picker.Item label="Lav" value="low" />
                            <Picker.Item label="Medium" value="medium" />
                            <Picker.Item label="Høj" value="high" />
                        </Picker>

                        {/* Manual time input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Starttid (HH:MM)"
                            value={startTime}
                            onChangeText={setStartTime}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Sluttid (HH:MM)"
                            value={endTime}
                            onChangeText={setEndTime}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Medlemmer (kommasepareret)"
                            value={members}
                            onChangeText={setMembers}
                        />

                        {/* Column selection */}
                        <Picker
                            selectedValue={selectedColumn}
                            style={styles.input}
                            onValueChange={(itemValue) => setSelectedColumn(itemValue)}
                        >
                            {columns.map((column) => (
                                <Picker.Item key={column.id} label={column.name} value={column.id} />
                            ))}
                        </Picker>

                        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                        <TouchableOpacity style={styles.button} onPress={saveTaskDetails}>
                            <Text style={styles.buttonText}>Gem detaljer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, { backgroundColor: "red" }]} onPress={deleteTask}>
                            <Text style={styles.buttonText}>Slet opgave</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButton}>Luk</Text>
                        </TouchableOpacity>
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
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 10,  // Reduced padding
        paddingTop: 20,  // Adjusted top padding for more compact layout
    },
    header: {
        fontSize: 22,  // Reduced font size for header
        fontWeight: "bold",
        marginBottom: 15,  // Reduced margin bottom
    },
    addTaskContainer: {
        width: "100%",
        marginBottom: 15,  // Reduced margin
        alignItems: "center",  // Centered the task addition form
    },
    input: {
        height: 35,  // Reduced input field height
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 8,  // Reduced margin
        paddingLeft: 10,
        borderRadius: 4,
        width: "60%",  // Set input width to 60% of the container width
    },
    button: {
        backgroundColor: "#173630",
        paddingVertical: 8,  // Reduced vertical padding
        borderRadius: 4,
        width: "60%",  // Set button width to 60% of the container width
        marginTop: 10,  // Space between button and input field
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 14,  // Reduced font size for buttons
    },
    errorText: {
        color: "red",
        fontSize: 12,  // Reduced error text size
    },
    board: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    column: {
        width: "18%",  // Reduced column width for a more compact board
        marginRight: 8,  // Reduced margin between columns
    },
    columnHeader: {
        fontSize: 16,  // Reduced font size for column headers
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,  // Reduced margin bottom
    },
    taskCard: {
        padding: 8,  // Reduced padding inside task cards
        borderRadius: 4,
        marginBottom: 8,  // Reduced margin between task cards
    },
    taskName: {
        fontSize: 14,  // Reduced font size for task names
        color: "#fff",
    },
    modalContent: {
        flex: 1,
        padding: 15,  // Reduced padding inside modal
    },
    modalTitle: {
        fontSize: 18,  // Reduced font size for modal title
        fontWeight: "bold",
        marginBottom: 8,  // Reduced margin bottom
    },
    closeButton: {
        color: "blue",
        marginTop: 15,  // Reduced margin top for close button
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
        fontSize: 14,  // Reduced font size for footer text
        lineHeight: 16,  // Adjusted line height for footer text
        textAlign: "center",
    },
    buttonRed: {
        backgroundColor: "red",
        paddingVertical: 8,
        borderRadius: 4,
        width: "60%",
        marginTop: 10,
    },

});
