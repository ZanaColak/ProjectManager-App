import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

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
    const [newColumnModalVisible, setNewColumnModalVisible] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");
    const [newColumnPosition, setNewColumnPosition] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const addTaskToBacklog = () => {
        if (!newTask.trim()) {
            setErrorMessage("Opgavenavn er påkrævet.");
            return;
        }

        const taskExists = columns.some((column) =>
            column.tasks.some((task) => task.name === newTask.trim())
        );

        if (taskExists) {
            setErrorMessage("Opgave med dette navn eksisterer allerede.");
            return;
        }

        const updatedColumns = columns.map((column) =>
            column.id === "todo"
                ? {
                    ...column,
                    tasks: [
                        ...column.tasks,
                        {
                            id: Date.now().toString(),
                            name: newTask,
                            priority: "low",
                            columnId: "todo",
                        },
                    ],
                }
                : column
        );

        setColumns(updatedColumns);
        setNewTask("");
        setErrorMessage("");
    };

    const createNewColumn = () => {
        if (
            !newColumnName.trim() ||
            isNaN(newColumnPosition) ||
            newColumnPosition < 0 ||
            newColumnPosition > columns.length
        ) {
            setErrorMessage("Ugyldige kolonneparametre.");
            return;
        }

        const newColumn = {
            id: Date.now().toString(),
            name: newColumnName,
            tasks: [],
        };

        const updatedColumns = [...columns];
        updatedColumns.splice(newColumnPosition, 0, newColumn);

        setColumns(updatedColumns);
        setNewColumnModalVisible(false);
        setNewColumnName("");
        setNewColumnPosition("");
        setErrorMessage("");
    };

    const openTaskDetails = (task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Scrumboard</Text>

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

            <TouchableOpacity
                style={[styles.button, { marginBottom: 20 }]}
                onPress={() => setNewColumnModalVisible(true)}
            >
                <Text style={styles.buttonText}>Opret ny kolonne</Text>
            </TouchableOpacity>

            <View style={styles.board}>
                {columns.map((column) => (
                    <View key={column.id} style={styles.column}>
                        <Text style={styles.columnHeader}>{column.name}</Text>
                        <FlatList
                            data={column.tasks}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => openTaskDetails(item)}>
                                    <View style={styles.taskCard}>
                                        <Text style={styles.taskName}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                ))}
            </View>

            <Modal visible={newColumnModalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Opret ny kolonne</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Kolonnenavn"
                        value={newColumnName}
                        onChangeText={setNewColumnName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Position (0 - {max kolonner})"
                        keyboardType="numeric"
                        value={newColumnPosition}
                        onChangeText={setNewColumnPosition}
                    />
                    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                    <TouchableOpacity style={styles.button} onPress={createNewColumn}>
                        <Text style={styles.buttonText}>Opret kolonne</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: "red" }]}
                        onPress={() => setNewColumnModalVisible(false)}
                    >
                        <Text style={styles.buttonText}>Annuller</Text>
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
    },
    addTaskContainer: {
        width: "100%",
        marginBottom: 15,
        alignItems: "center",
    },
    input: {
        height: 35,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 8,
        paddingLeft: 10,
        borderRadius: 4,
        width: "60%",
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
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
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
