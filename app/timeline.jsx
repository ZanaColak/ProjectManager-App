import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";

const Timeline = ({ projects = [], tasks = [], teamMembers = [] }) => {
    const [filterType, setFilterType] = useState("all"); // Filter for "all", "projects", "tasks", or "teamMember"
    const [timeFilter, setTimeFilter] = useState(7); // Default is 1 week (7 days)
    const [selectedTeamMember, setSelectedTeamMember] = useState(null); // Selected team member
    const [filteredData, setFilteredData] = useState([...projects, ...tasks]);

    const [isTimeFilterModalVisible, setIsTimeFilterModalVisible] = useState(false);
    const [isFilterTypeModalVisible, setIsFilterTypeModalVisible] = useState(false);
    const [isTeamMemberModalVisible, setIsTeamMemberModalVisible] = useState(false); // For selecting team member

    // Handle filter change (projects/tasks/all/teamMember)
    const handleFilterChange = (type) => {
        setFilterType(type);
        if (type === "all") {
            setFilteredData([...projects, ...tasks]);
        } else if (type === "tasks") {
            setFilteredData(tasks);
        } else if (type === "teamMember" && selectedTeamMember) {
            // Filter tasks based on selected team member
            const memberTasks = tasks.filter((task) =>
                task.assignedTo.includes(selectedTeamMember)
            );
            setFilteredData(memberTasks);
        }
        setIsFilterTypeModalVisible(false);
    };

    // Handle time filter change
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

    // Generate timeline dates
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

    const handleProjectChange = (projectName) => {
        setSelectedProject(projectName);
        setFilterType("projectTasks");

        const projectTasks = tasks.filter((task) =>
            task.projectName === projectName
        );

        setFilteredData(projectTasks);
    };

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

    const [timelineStartDate, setTimelineStartDate] = useState(new Date()); // Startdatoen for timelinen

    const renderTimelineLine = (item, index) => {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const timelineStartDate = new Date(generateTimelineDates()[0]); // Første dato i timelinen
        const totalTimelineDays = generateTimelineDates().length;

        // Beregn antal dage fra timelineens startdato til opgavernes startdato
        const offsetDays = Math.floor((startDate - timelineStartDate) / (1000 * 60 * 60 * 24));
        const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Beregn placering og bredde af linjen som procent af total længde af timelinen
        const offset = (offsetDays / totalTimelineDays) * 100;
        const lineWidth = (durationDays / totalTimelineDays) * 100;

        return (
            <View
                key={index}
                style={{
                    ...styles.timelineLine,
                    left: `${offset}%`, // Placer linjen baseret på startdatoen
                    width: `${lineWidth}%`, // Linjens bredde afhængigt af opgavens varighed
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
                    <Text style={styles.filterLabel}>Tid: {timeFilter === 7 ? "1 uge" : timeFilter === 30 ? "1 måned" : "Dag"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsFilterTypeModalVisible(true)}>
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
                <TouchableOpacity onPress={() => setIsTeamMemberModalVisible(true)}>
                    <Text style={styles.filterLabel}>Teammedlem</Text>
                </TouchableOpacity>
            </View>

            {/* Timeline Section */}
            <View style={{ ...styles.timelineLineContainer, height: containerHeight }}>
                <View style={styles.dateContainer}>{renderTimelineDates()}</View>
                <ScrollView style={styles.scrollContainer}>
                    <View style={styles.timelineContainer}>
                        {filteredData.map((item, index) => renderTimelineLine(item, index))}
                    </View>
                </ScrollView>
            </View>

            {/* Time Filter Modal */}
            <Modal visible={isTimeFilterModalVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText} onPress={() => handleTimeFilterChange(7)}>1 uge</Text>
                        <Text style={styles.modalText} onPress={() => handleTimeFilterChange(30)}>1 måned</Text>
                        <Text style={styles.modalText} onPress={() => handleTimeFilterChange(1)}>Dag</Text>
                    </View>
                </View>
            </Modal>

            {/* Filter Type Modal */}
            <Modal visible={isFilterTypeModalVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText} onPress={() => handleFilterChange("all")}>Vis alle</Text>
                        <Text style={styles.modalText} onPress={() => handleFilterChange("tasks")}>Kun opgaver</Text>
                    </View>
                </View>
            </Modal>

            <Modal visible={isTeamMemberModalVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {projects.map((project, index) => (
                            <Text
                                key={index}
                                style={styles.modalText}
                                onPress={() => handleProjectChange(project.name)}
                            >
                                {project.name}
                            </Text>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Team Member Modal */}
            <Modal visible={isTeamMemberModalVisible} transparent animationType="fade">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {teamMembers.map((member, index) => (
                            <Text key={index} style={styles.modalText} onPress={() => handleTeamMemberChange(member)}>
                                {member}
                            </Text>
                        ))}
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
        {
            id: 1,
            name: "Projekt 1",
            startDate: "2024-12-01T08:00:00",
            endDate: "2024-12-05T17:00:00",
            assignedTo: ["Member 1"]
        },
        {
            id: 2,
            name: "Projekt 2",
            startDate: "2024-12-03T09:00:00",
            endDate: "2024-12-10T18:00:00",
            assignedTo: ["Member 2"]
        }
    ];


    const testTasks = [
        { name: "Opgave 1", startDate: "2024-12-02T08:30:00", endDate: "2024-12-04T16:00:00", assignedTo: ["Member 1", "Member 2"] },
        { name: "Opgave 2", startDate: "2024-12-06T10:00:00", endDate: "2024-12-08T14:00:00", assignedTo: ["Member 2"] },
    ];

    const teamMembers = ["Member 1", "Member 2", "Member 3"];

    return (
        <View style={{ flex: 1 }}>
            <Timeline tasks={testTasks} teamMembers={teamMembers} />
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
        justifyContent: "space-between",
        marginBottom: 10,
    },
    filterLabel: {
        fontSize: 18,
        color: "#333",
    },
    dateContainer: {
        marginBottom: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },
    modalContainer: {
        width: 250,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center" },
    modalText: {
        fontSize: 18,
        marginBottom: 15 },
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
});
