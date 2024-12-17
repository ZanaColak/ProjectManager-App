import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Picker } from "react-native";

const Timeline = ({ projects = [], tasks = [] }) => {
    const [filterType, setFilterType] = useState("all"); // Filter for "all", "projects", or "tasks"
    const [timeFilter, setTimeFilter] = useState(7); // Default is 1 week (7 days)
    const [filteredData, setFilteredData] = useState([...tasks]); // Start with tasks filtered by default

    const [selectedProject, setSelectedProject] = useState(null); // To store selected project
    const [selectedTeamMember, setSelectedTeamMember] = useState(null); // To store selected team member
    const [isTimeFilterModalVisible, setIsTimeFilterModalVisible] = useState(false);
    const [isFilterTypeModalVisible, setIsFilterTypeModalVisible] = useState(false);

    // Handle filter change (projects/tasks/all)
    const handleFilterChange = (type) => {
        setFilterType(type);
        if (type === "all") {
            setFilteredData([...tasks]); // If 'all', show all tasks
        } else if (type === "tasks") {
            setFilteredData(tasks);
        }
        setIsFilterTypeModalVisible(false);
    };

    // Handle time filter change
    const handleTimeFilterChange = (days) => {
        setTimeFilter(days);
        setIsTimeFilterModalVisible(false);
    };

    // Filter tasks by selected project and team member
    useEffect(() => {
        let filteredTasks = tasks;

        if (selectedProject) {
            filteredTasks = filteredTasks.filter((task) => task.projectId === selectedProject.id);
        }

        if (selectedTeamMember) {
            filteredTasks = filteredTasks.filter((task) => task.teammember === selectedTeamMember);
        }

        setFilteredData(filteredTasks);
    }, [selectedProject, selectedTeamMember, tasks]);

    // Generate timeline dates
    const generateTimelineDates = () => {
        const allDates = [];
        const allItems = tasks;

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

    // Render timeline dates with proper spacing
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

    // Render timeline lines for tasks
    const renderTimelineLine = (item, index) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const timelineStartDate = new Date(generateTimelineDates()[0]);

        const totalTimelineDays = generateTimelineDates().length;

        // Offset calculation
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

            {/* Filter Container */}
            <View style={styles.filterContainer}>
                <TouchableOpacity onPress={() => setIsTimeFilterModalVisible(true)}>
                    <Text style={styles.filterLabel}>
                        Tid: {timeFilter === 7 ? "1 uge" : timeFilter === 30 ? "1 måned" : "Dag"}
                    </Text>
                </TouchableOpacity>

                {/* Dropdowns for Project and Team Member */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Project Picker */}
                    <Picker
                        selectedValue={selectedProject}
                        onValueChange={(itemValue) => setSelectedProject(itemValue)}
                        style={styles.dropdownContainer}
                    >
                        <Picker.Item label="Vælg et projekt" value={null} />
                        {projects.map((project) => (
                            <Picker.Item key={project.id} label={project.name} value={project} />
                        ))}
                    </Picker>

                    {/* Team Member Picker */}
                    <Picker
                        selectedValue={selectedTeamMember}
                        onValueChange={(itemValue) => setSelectedTeamMember(itemValue)}
                        style={styles.dropdownContainer}
                    >
                        <Picker.Item label="Vælg teammedlem" value={null} />
                        {tasks.map((task) => (
                            <Picker.Item key={task.teammember} label={task.teammember} value={task.teammember} />
                        ))}
                    </Picker>
                </View>

                <TouchableOpacity onPress={() => setIsFilterTypeModalVisible(true)}>
                    <Text style={styles.filterLabel}>
                        {filterType === "all" ? "Vis alle" : filterType === "tasks" ? "Kun opgaver" : "Kun projekter"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Timeline Section */}
            <View style={{ ...styles.timelineLineContainer, height: containerHeight, flex: 1 }}>
                <View style={styles.dateContainer}>{renderTimelineDates()}</View>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.timelineContainer}>
                        {filteredData.map((item, index) => renderTimelineLine(item, index))}
                    </View>
                </ScrollView>
            </View>

            {/* Time Filter Modal */}
            <Modal visible={isTimeFilterModalVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText} onPress={() => handleTimeFilterChange(7)}>
                            1 uge
                        </Text>
                        <Text style={styles.modalText} onPress={() => handleTimeFilterChange(30)}>
                            1 måned
                        </Text>
                    </View>
                </View>
            </Modal>

            {/* Filter Type Modal */}
            <Modal visible={isFilterTypeModalVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText} onPress={() => handleFilterChange("all")}>
                            Vis alle
                        </Text>
                        <Text style={styles.modalText} onPress={() => handleFilterChange("tasks")}>
                            Kun opgaver
                        </Text>
                    </View>
                </View>
            </Modal>

            <View style={styles.bottomBox}>
                <Text style={styles.boxText}>
                    Copyright © 2024 Novozymes A/S, part of Novonesis Group
                </Text>
            </View>
        </View>
    );
};

export default function App() {
    const testProjects = [
        { id: 1, name: "Projekt 1", startDate: "2024-12-01T08:00:00", endDate: "2024-12-05T17:00:00" },
        { id: 2, name: "Projekt 2", startDate: "2024-12-03T09:00:00", endDate: "2024-12-10T18:00:00" },
    ];

    const testTasks = [
        { name: "Opgave 1", projectId: 1, startDate: "2024-12-02T08:30:00", endDate: "2024-12-04T16:00:00", teammember: "Teammedlem 1" },
        { name: "Opgave 2", projectId: 2, startDate: "2024-12-06T10:00:00", endDate: "2024-12-08T14:00:00", teammember: "Teammedlem 2" },
        { name: "Opgave 3", projectId: 1, startDate: "2024-12-10T08:30:00", endDate: "2024-12-12T16:00:00", teammember: "Teammedlem 1" },
    ];

    return (
        <View style={{ flex: 1 }}>
            <Timeline projects={testProjects} tasks={testTasks} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    filterContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: 'center',
        width: '100%',
    },
    dropdownContainer: {
        width: 150,
        marginHorizontal: 10,
    },
    filterLabel: {
        fontSize: 18,
        color: "#333",
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
    timelineContainer: {
        position: "relative",
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
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        width: 250,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
    },
    bottomBox: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 70,
        backgroundColor: "#173630",
        justifyContent: "center",
        alignItems: "center",
    },
    boxText: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 18,
        textAlign: "center",
    },
});
