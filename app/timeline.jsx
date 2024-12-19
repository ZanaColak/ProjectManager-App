import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { fetchProjects } from "./services/dataService";
import Icon from "react-native-vector-icons/FontAwesome";
import {router, useGlobalSearchParams} from "expo-router";
import {addDoc, deleteDoc, updateDoc, doc, collection} from "firebase/firestore";
import { database } from "./config/firebase";

export default function Timeline() {
    const { uid, department, role } = useGlobalSearchParams(); // Get params from URL
    const { projects, loading, error } = fetchProjects(department);

    const [selectedProject, setSelectedProject] = useState(""); // Track selected project
    const [filterType, setFilterType] = useState("all");
    const [timeFilter, setTimeFilter] = useState(7);
    const [selectedTeamMember, setSelectedTeamMember] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [tasks, setTasks] = useState([]);


    const [isTimeFilterModalVisible, setIsTimeFilterModalVisible] = useState(false);
    const [isFilterTypeModalVisible, setIsFilterTypeModalVisible] = useState(false);
    const [isTeamMemberModalVisible, setIsTeamMemberModalVisible] = useState(false);
    const [isProjectModalVisible, setIsProjectModalVisible] = useState(false); // Project filter modal visibility

    useEffect(() => {
        // Fetching task data if necessary
        const fetchData = async () => {
            try {
                const { tasksData } = await fetchTasks(department); // Assuming fetchTasks is similar to fetchProjects
                setTasks(tasksData);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            }
        };
        fetchData();
    }, [department]);


    const handleFilterChange = (type) => {
        setFilterType(type);
        if (type === "all") {
            setFilteredData([...projects, ...tasks]);
        } else if (type === "tasks") {
            setFilteredData(tasks);
        } else if (type === "teamMember" && selectedTeamMember) {
            const memberTasks = tasks.filter((task) =>
                task.assignedTo.includes(selectedTeamMember)
            );
            setFilteredData(memberTasks);
        } else if (type === "projectTasks" && selectedProject) {
            const projectTasks = tasks.filter((task) =>
                task.projectName === selectedProject
            );
            setFilteredData(projectTasks);
        }
        setIsFilterTypeModalVisible(false);
    };

    const handleTimeFilterChange = (days) => {
        setTimeFilter(days);
        setIsTimeFilterModalVisible(false);
    };

    const handleTeamMemberChange = (member) => {
        setSelectedTeamMember(member);
        setIsTeamMemberModalVisible(false);

        const memberTasks = tasks.filter((task) =>
            task.assignedTo.includes(member)
        );

        if (memberTasks.length > 0) {
            setFilteredData(memberTasks);
        } else {
            setFilteredData([]);
        }

        setFilterType("teamMember");
    };

    const handleProjectChange = (project) => {
        setSelectedProject(project);
        setFilterType("projectTasks");
        const projectTasks = tasks.filter((task) =>
            task.projectName === project
        );
        setFilteredData(projectTasks);
        setIsProjectModalVisible(false); // Close the project filter modal
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
            <Text style={styles.header}>Projekt og Task Timeline</Text>

            <View style={styles.filterContainer}>
                {/* Time Filter Button */}
                <TouchableOpacity onPress={() => setIsTimeFilterModalVisible(true)} style={styles.filterButton}>
                    <Text style={styles.filterLabel}>
                        Tid: {timeFilter === 7 ? "1 uge" : timeFilter === 30 ? "1 måned" : "Dag"}
                    </Text>
                </TouchableOpacity>
                {/* Filter Type Button */}
                <TouchableOpacity onPress={() => setIsFilterTypeModalVisible(true)} style={styles.filterButton}>
                    <Text style={styles.filterLabel}>
                        {filterType === "all"
                            ? "Vis alle"
                            : filterType === "tasks"
                                ? "Kun opgaver"
                                : filterType === "projectTasks" && selectedProject
                                    ? `Projekt: ${selectedProject}`
                                    : selectedTeamMember
                                        ? `Medlem: ${selectedTeamMember}`
                                        : "Teammedlem"}
                    </Text>
                </TouchableOpacity>
                {/* Team Member Filter Button */}
                <TouchableOpacity onPress={() => setIsTeamMemberModalVisible(true)} style={styles.filterButton}>
                    <Text style={styles.filterLabel}>Medlem</Text>
                </TouchableOpacity>
                {/* Project Filter Button */}
                <TouchableOpacity onPress={() => setIsProjectModalVisible(true)} style={styles.filterButton}>
                    <Text style={styles.filterLabel}>Projekt</Text>
                </TouchableOpacity>
            </View>


            {/* Project filter modal */}
            <Modal
                visible={isProjectModalVisible}
                onRequestClose={() => setIsProjectModalVisible(false)}
                animationType="slide"
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalHeader}>Vælg Projekt</Text>
                    {loading && <Text>Loading projects...</Text>}
                    {error && <Text>Error loading projects: {error.message}</Text>}
                    {!loading && !error && projects.map((project) => (
                        <TouchableOpacity key={project.id} onPress={() => handleProjectChange(project.name)}>
                            <Text style={styles.modalOption}>{project.name}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity onPress={() => setIsProjectModalVisible(false)}>
                        <Text style={styles.closeModal}>Luk</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <View style={{ ...styles.timelineLineContainer, height: containerHeight }}>
                <View style={styles.dateContainer}>{renderTimelineDates()}</View>
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.timelineContainer}>
                        {filteredData.map((item, index) => renderTimelineLine(item, index))}
                    </View>
                </ScrollView>
            </View>

            <View style={styles.bottomBox}>
                <Text style={styles.boxText}>Copyright © 2024 Novozymes A/S, part of Novonesis Group</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: "row",
        flexWrap: "wrap", // Allow the filter buttons to wrap if they exceed screen width
        justifyContent: "space-between", // Evenly distribute the space between buttons
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    filterButton: {
        flexBasis: "48%", // Allow filter buttons to take up 48% of the container width, with some margin for spacing
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    filterLabel: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
    },
    dateContainer: {
        marginBottom: 10,
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    dateColumn: {
        alignItems: "center",
        width: 50,
    },
    dateText: {
        fontSize: 12,
        fontWeight: "600",
    },
    timelineLineContainer: {
        flex: 1,
        position: "relative",
        width: "100%",
    },
    scrollContainer: {
        flexGrow: 1,
    },
    timelineContainer: {
        position: "relative",
        minHeight: 500,
    },
    timelineLine: {
        position: "absolute",
        height: 20,
        backgroundColor: "#4CAF50",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
    },
    lineText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    bottomBox: {
        width: "100%",
        height: 70,
        backgroundColor: "#173630",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        left: 0,
    },
    boxText: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 18,
        textAlign: "center",
    },
    modalContainer: {
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    modalHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalOption: {
        fontSize: 16,
        paddingVertical: 10,
    },
    closeModal: {
        fontSize: 16,
        color: "#007BFF",
        marginTop: 20,
    },
});
