import React, {useState, useEffect} from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
} from "react-native";
import {fetchProjects, fetchTasksForProject} from "./services/dataService";
import { createTask } from "./task";
import {useGlobalSearchParams} from "expo-router";
import {Picker} from "@react-native-picker/picker";


console.log()
export default function ScrumBoard() {
    const {uid, department, role} = useGlobalSearchParams();
    const [project, setProjects] = useState([]);
    const [columns, setColumns] = useState([
        {id: "todo", name: "Backlog", tasks: []},
        {id: "inprogress", name: "In Progress", tasks: []},
        {id: "review", name: "Review", tasks: []},
        {id: "done", name: "Done", tasks: []},
        {id: "blocked", name: "Blocked", tasks: []},
    ]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [estimatedTime, setEstimatedTime] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [projectModalVisible, setProjectModalVisible] = useState(false);
    const [editingColumnId, setEditingColumnId] = useState(null);
    const [editedColumnName, setEditedColumnName] = useState("");
    const {projects, loading, error} = fetchProjects(department);


    useEffect(() => {
        const loadTasks = async () => {
            if (selectedProject) {
                const { tasks, success, error } = await fetchTasksForProject(
                    selectedProject.id
                );

                if (success) {
                    // Assign tasks to appropriate columns
                    const updatedColumns = columns.map((column) => ({
                        ...column,
                        tasks: tasks.filter((task) => task.column === column.id),
                    }));
                    setColumns(updatedColumns);
                } else {
                    setErrorMessage(error);
                }
            }
        };

        loadTasks();
    }, [selectedProject, columns]); // Depend on selectedProject and columns


    useEffect(() => {
        const loadTasks = async () => {
            if (selectedProject) {
                const { tasks, success, error } = await fetchTasksForProject(
                    selectedProject.id
                );

                if (success) {
                    console.log("Fetched tasks for project:", tasks); // Check if tasks are fetched

                    // Assign tasks to appropriate columns based on their 'column' field
                    const updatedColumns = columns.map((column) => ({
                        ...column,
                        tasks: tasks.filter((task) => task.column === column.id),
                    }));

                    // Update the state for columns
                    setColumns(updatedColumns);
                } else {
                    setErrorMessage(error);
                }
            }
        };

        loadTasks();
    }, [selectedProject]); // Only depend on selectedProject

    const loadProjectTasks = async (projectId) => {
        const {success, tasks, error} = await fetchTasksForProject(projectId);
        if (success) {
            console.log("Tasks for project:", tasks); // Logs an array of task objects
        } else {
            console.error("Error fetching tasks:", error);
        }
    };

    const fetchProjectData = async () => {
        try {
            const response = await fetchProjects(department);
            if (response.projects && response.projects.length > 0) {
                setProjects(response.projects);
                setSelectedProject(response.projects[0]);  // Default to first project
            } else {
                setErrorMessage("No projects found.");
            }
        } catch (err) {
            setErrorMessage("Error fetching projects.");
        }
    };


    const addTask = async () => {
        if (!selectedProject) {
            setErrorMessage("Please select a project.");
            return;
        }

        if (!newTaskTitle.trim() || !newTaskDescription.trim()) {
            setErrorMessage("Task title and description are required.");
            return;
        }

        const newTask = {
            name: newTaskTitle,
            description: newTaskDescription,
            completed: false,
            column: "todo",  // Default to "To Do" column
            priority: priority,
            estimatedTime: estimatedTime,
            projectId: selectedProject.id, // Ensure you pass the selected project's id
            createdAt: new Date(),
        };

        // Log all inputs here before creating the task
        console.log("Task Data:", newTask);

        // Create the new task using createTask, passing the newTask object
        const {success, error} = await createTask(newTask);

        if (success) {
            // If task is successfully added, update the columns locally
            const updatedColumns = columns.map((column) =>
                column.id === "todo"
                    ? {...column, tasks: [...column.tasks, newTask]}
                    : column
            );

            setColumns(updatedColumns);
            setModalVisible(false);
            setNewTaskTitle("");
            setNewTaskDescription("");
            setEstimatedTime("");
            setPriority("Medium");
            setErrorMessage("");
        } else {
            setErrorMessage(error);
        }
    };



    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setProjectModalVisible(false);
    };

    // Add new column
    const addColumn = () => {
        const newColumn = {
            id: `new-${columns.length + 1}`,
            name: "New Column",
            tasks: [],
        };
        setColumns([...columns, newColumn]);
    };

    // Edit column name
    const handleColumnEdit = (columnId) => {
        setEditingColumnId(columnId);
        const columnToEdit = columns.find((col) => col.id === columnId);
        setEditedColumnName(columnToEdit.name);
    };

    const handleColumnNameChange = () => {
        if (editedColumnName.trim()) {
            const updatedColumns = columns.map((column) =>
                column.id === editingColumnId
                    ? {...column, name: editedColumnName}
                    : column
            );
            setColumns(updatedColumns);
            setEditingColumnId(null);
            setEditedColumnName("");
        } else {
            setErrorMessage("Column name cannot be empty.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Scrumboard - {selectedProject ? selectedProject.name : "Select a project"}
            </Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)} // Open modal to create new task
            >
                <Text style={styles.buttonText}>Create New Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={addColumn}
            >
                <Text style={styles.buttonText}>Add Column</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => setProjectModalVisible(true)} // Open project selection modal
            >
                <Text style={styles.buttonText}>Select Project</Text>
            </TouchableOpacity>

            <View style={styles.board}>
                {columns.map((column) => (
                    <View key={column.id} style={styles.column}>
                        <Text style={styles.columnHeader}>
                            {editingColumnId === column.id ? (
                                <TextInput
                                    style={styles.input}
                                    value={editedColumnName}
                                    onChangeText={setEditedColumnName}
                                    onSubmitEditing={handleColumnNameChange}
                                    onBlur={handleColumnNameChange}
                                    autoFocus
                                />
                            ) : (
                                <TouchableOpacity onPress={() => handleColumnEdit(column.id)}>
                                    <Text style={styles.columnTitle}>{column.name}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => deleteColumn(column.id)}
                            >
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </Text>
                        <FlatList
                            data={column.tasks} // This should now be populated with tasks from the state
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => openTaskDetails(item)}>
                                    <View style={styles.taskCard}>
                                        <Text style={styles.taskName}>{item.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.createdAt.toString()} // Make sure 'createdAt' is present in the task object
                        />

                    </View>
                ))}
            </View>

            {/* Task Creation Modal */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Create New Task</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Task Title"
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Task Description"
                        value={newTaskDescription}
                        onChangeText={setNewTaskDescription}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Estimated Time"
                        value={estimatedTime}
                        onChangeText={setEstimatedTime}
                    />
                    <View style={styles.pickerContainer}>
                        <Text>Priority</Text>
                        <Picker
                            selectedValue={priority}
                            onValueChange={setPriority}
                        >
                            <Picker.Item label="Low" value="Low"/>
                            <Picker.Item label="Medium" value="Medium"/>
                            <Picker.Item label="High" value="High"/>
                        </Picker>
                    </View>

                    {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

                    <TouchableOpacity style={styles.button} onPress={addTask}>
                        <Text style={styles.buttonText}>Create Task</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, {backgroundColor: "red"}]}
                        onPress={() => setModalVisible(false)} // Close modal
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Select Project Modal */}
            <Modal visible={projectModalVisible} animationType="slide">
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select a Project</Text>
                    <FlatList
                        data={projects}
                        renderItem={({item}) => (
                            <TouchableOpacity onPress={() => handleProjectSelect(item)}>
                                <View style={styles.projectCard}>
                                    <Text style={styles.projectName}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id.toString()}
                    />
                    <TouchableOpacity
                        style={[styles.button, {backgroundColor: "red", marginTop: 20}]}
                        onPress={() => setProjectModalVisible(false)} // Close modal
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
