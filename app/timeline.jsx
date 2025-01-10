import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { fetchProjects } from "./services/dataService";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { useGlobalSearchParams } from "expo-router";
import { database } from "./config/firebase";

export default function Timeline() {
    const { uid, department, role } = useGlobalSearchParams(); // Get params from URL
    const { loading: projectsLoading, error } = fetchProjects(department);
    const [selectedProject, setSelectedProject] = useState(""); // Track selected project
    const [filterType, setFilterType] = useState("all");
    const [timeFilter, setTimeFilter] = useState(7); // Default to 1 week
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true); // Define loading state
    const [projects, setProjects] = useState([]);

    const [isFilterTypeModalVisible, setIsFilterTypeModalVisible] = useState(false);
    const [isTeamMemberModalVisible, setIsTeamMemberModalVisible] = useState(false);
    const [isProjectModalVisible, setIsProjectModalVisible] = useState(false); // Project filter modal visibility
    const projectQuery = collection(database, "projects");
    const timelineQuery = selectedProject && collection(database, `projects/${selectedProject.id}/timeline`);

    useEffect(() => {
        const fetchProjects = async () => {
            const projectSnapshot = await getDocs(projectQuery);
            const projectList = projectSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProjects(projectList);
        };

        fetchProjects();
    }, []);

    // Fetch departments from Firestore
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const db = getFirestore();
                const querySnapshot = await getDocs(collection(db, "departments")); // Assuming departments are stored in 'departments' collection
                const departmentList = querySnapshot.docs.map((doc) => doc.data().name); // Modify this based on your data structure
                setDepartments(departmentList);
            } catch (error) {
                console.error("Error fetching departments: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleFilterChange = (type) => {
        setFilterType(type);

        if (type === "all") {
            setFilteredData(tasks); // Show all tasks
        } else if (type === "projectTasks" && selectedProject) {
            const projectTasks = tasks.filter((task) => task.projectName === selectedProject);
            setFilteredData(projectTasks); // Filter tasks for selected project
        }

        setIsFilterTypeModalVisible(false); // Close filter type modal
    };


    const handleProjectChange = (project) => {
        setSelectedProject(project);
        const projectTasks = tasks.filter((task) => task.projectName === project);
        setFilteredData(projectTasks); // Update filter to show only tasks for selected project
        setIsProjectModalVisible(false);
    };

    const renderProjectTasks = () => {
        return filteredData.map((task, index) => (
            <TouchableOpacity key={index} onPress={() => console.log(`Task selected: ${task.name}`)}>
                <Text style={styles.modalOption}>{task.name}</Text>
            </TouchableOpacity>
        ));
    };

    const handleDepartmentChange = (department) => {
        setSelectedDepartment(department);
        setIsTeamMemberModalVisible(false); // Close modal after selecting department
    };

    const generateTimelineDates = () => {
        const allDates = [];
        const allItems = [...projects, ...tasks];

        let earliestStart = new Date(Math.min(...allItems.map(item => new Date(item.startDate).getTime())));
        let latestEnd = new Date(Math.max(...allItems.map(item => new Date(item.endDate).getTime())));

        earliestStart.setDate(earliestStart.getDate() - timeFilter);
        latestEnd.setDate(latestEnd.getDate() + timeFilter);

        for (let date = new Date(earliestStart); date <= latestEnd; date.setDate(date.getDate() + 1)) {
            allDates.push(new Date(date));
        }

        return allDates;
    };

    const containerHeight = Math.max(filteredData.length * 50, 120);

    const renderTimelineDates = () => {
        const dates = generateTimelineDates();

        return (
            <View style={styles.dateRow}>
                {dates.map((date, index) => (
                    <View key={index} style={styles.dateColumn}>
                        <Text style={styles.dateText}>{date.getDate()}</Text>
                        <Text style={styles.dateText}>{date.toLocaleDateString([], { month: "short" })}</Text>
                    </View>
                ))}
            </View>
        );
    };

    const renderTimelineLine = (item, index) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const timelineStartDate = new Date(generateTimelineDates()[0]);
        const totalTimelineDays = generateTimelineDates().length;

        const offsetDays = Math.floor((startDate - timelineStartDate) / (1000 * 60 * 60 * 24));
        const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

        const offset = (offsetDays / totalTimelineDays) * 100;
        const lineWidth = (durationDays / totalTimelineDays) * 100;

        return (
            <View
                key={index}
                style={{
                    ...styles.timelineLine,
                    left: `${offset}%`,
                    width: `${lineWidth}%`,
                    top: index * 50,
                }}
            >
                <Text style={styles.lineText}>{item.name}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Project and Task Timeline</Text>

            <View style={styles.filterContainer}>
                {/* Time Filter - Always shows 1 week */}
                <Text style={styles.filterLabel}>Time: 1 week</Text>


                {/* Department Filter */}
                <TouchableOpacity onPress={() => setIsTeamMemberModalVisible(true)} style={styles.filterButton}>
                    <Text style={styles.filterLabel}>
                        {selectedDepartment ? `Department: ${selectedDepartment}` : "Select Department"}
                    </Text>
                </TouchableOpacity>



                {/* Project Filter */}
                <TouchableOpacity onPress={() => setIsProjectModalVisible(true)} style={styles.filterButton}>
                    <Text style={styles.filterLabel}>
                        {selectedProject ? `Project: ${selectedProject}` : "Vælg projekt"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Team Member Modal */}
            <Modal
                visible={isTeamMemberModalVisible}
                onRequestClose={() => setIsTeamMemberModalVisible(false)}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalHeader}>Select Department</Text>
                    {loading ? (
                        <Text>Loading...</Text>
                    ) : (
                        departments.length > 0 ? (
                            departments.map((department, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleDepartmentChange(department)}
                                >
                                    <Text style={styles.modalOption}>{department}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text>No departments available</Text>
                        )
                    )}
                    <TouchableOpacity onPress={() => setIsTeamMemberModalVisible(false)}>
                        <Text style={styles.closeModal}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>


            {/* Project Filter Modal */}
            <Modal visible={isProjectModalVisible}
                   onRequestClose={() => setIsProjectModalVisible(false)}
                   animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalHeader}>Vælg projekt</Text>
                    {loading && <Text>Loading projects...</Text>}
                    {error && <Text>Error loading projects: {error.message}</Text>}
                    {!loading &&
                        !error &&
                        projects.map((project) => (
                            <TouchableOpacity
                                key={project.id}
                                onPress={() => handleProjectChange(project.name)}
                            >
                                <Text style={styles.modalOption}>{project.name}</Text>
                            </TouchableOpacity>
                        ))}
                    <TouchableOpacity onPress={() => setIsProjectModalVisible(false)}>
                        <Text style={styles.closeModal}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Timeline */}
            <View style={{ ...styles.timelineLineContainer, height: containerHeight }}>
                <View style={styles.dateContainer}>{renderTimelineDates()}</View>
                <View style={styles.timelineContainer}>
                    {filteredData.map(renderTimelineLine)}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    filterButton: {
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
    },
    filterLabel: {
        fontSize: 14,
        marginLeft: 5,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalHeader: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalOption: {
        fontSize: 16,
        marginVertical: 10,
    },
    closeModal: {
        fontSize: 16,
        color: "blue",
        marginTop: 20,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 10,
    },
    dateColumn: {
        alignItems: "center",
    },
    dateText: {
        fontSize: 14,
        color: "#000",
    },
    timelineLineContainer: {
        marginTop: 20,
    },
    timelineLine: {
        position: "absolute",
        backgroundColor: "lightblue",
        paddingVertical: 5,
        borderRadius: 5,
    },
    lineText: {
        fontSize: 12,
        color: "#000",
    },
    timelineContainer: {
        position: "relative",
    },
});
