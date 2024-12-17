import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { fetchProjectData } from './firebase'; // Replace with your data fetching logic

export default function ProjectCalendar() {
    const [projects, setProjects] = useState([]);
    const [showLegend, setShowLegend] = useState(false);

    useEffect(() => {
        // Fetch project data (replace with actual fetch logic)
        const getProjects = async () => {
            const data = await fetchProjectData(); // Replace with your fetch logic
            setProjects(data);
        };

        getProjects();
    }, []);

    // Helper function to determine the status color for each project
    const getStatusColor = (dueDate) => {
        const today = new Date();
        const deadline = new Date(dueDate);

        // Calculate the time difference
        const timeDifference = deadline - today;

        if (timeDifference < 0) {
            return 'red'; // Overdue
        } else if (timeDifference < 3 * 24 * 60 * 60 * 1000) {
            return 'yellow'; // Near deadline (within 3 days)
        } else {
            return 'green'; // Upcoming
        }
    };

    // Generate the calendar events for each project
    const generateMarkedDates = () => {
        const markedDates = {};

        projects.forEach((project) => {
            const statusColor = getStatusColor(project.deadline);
            markedDates[project.deadline] = {
                marked: true,
                dotColor: statusColor,
                activeOpacity: 0.7,
                customStyles: {
                    container: {
                        backgroundColor: 'transparent',
                    },
                },
            };
        });

        return markedDates;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Project Calendar</Text>
            <Calendar
                markedDates={generateMarkedDates()}
                markingType="custom"
                onDayPress={(day) => {
                    const selectedProject = projects.find(
                        (project) => project.deadline === day.dateString
                    );
                    if (selectedProject) {
                        alert(`Project: ${selectedProject.name}\nDeadline: ${selectedProject.deadline}`);
                    }
                }}
                style={styles.calendar}
            />

            <TouchableOpacity onPress={() => setShowLegend(true)} style={styles.legendButton}>
                <Text style={styles.legendButtonText}>Show Legend</Text>
            </TouchableOpacity>

            {/* Legend Modal */}
            <Modal
                transparent
                visible={showLegend}
                animationType="fade"
                onRequestClose={() => setShowLegend(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Color Code Legend:</Text>
                        <View style={styles.legendContainer}>
                            <Text style={[styles.legendText, { color: 'green' }]}>• Upcoming</Text>
                            <Text style={[styles.legendText, { color: 'yellow' }]}>• Near Deadline</Text>
                            <Text style={[styles.legendText, { color: 'red' }]}>• Overdue</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowLegend(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    calendar: {
        width: '90%',
        marginBottom: 20,
    },
    legendButton: {
        padding: 10,
        backgroundColor: '#173630',
        borderRadius: 5,
        marginBottom: 10,
    },
    legendButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center', // Center modal content vertically
        alignItems: 'center', // Center modal content horizontally
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
    },
    modalContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center', // Center content horizontally inside the modal
        justifyContent: 'center', // Center content vertically inside the modal
    },
    modalText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    legendContainer: {
        marginBottom: 20,
    },
    legendText: {
        fontSize: 16,
        marginBottom: 5,
    },
    closeButton: {
        backgroundColor: '#173630',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
