import React, { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faChessBoard, faBars, faTimeline, faCalendarDays,  faDiagramProject } from '@fortawesome/free-solid-svg-icons';

export default function DepartmentSelection() {
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const router = useRouter();

    const choice = [
        { label: "Projekt Leder", value: "", icon: faDiagramProject},
        { label: "Kalender", value: "", icon: faCalendarDays },
        { label: "Tidslinje", value: "", icon: faTimeline },
        { label: "Projekt Indstillinger", value: "", icon: faBars },
        { label: "Scrumboard", value: "scrumboard", icon: faChessBoard },
        { label: "Log Ud", value: "signOut", icon: faArrowRightFromBracket },
    ];

    const handleNavigation = async (itemValue) => {
        setSelectedDepartment(itemValue);
        if (itemValue === "signOut") {
            await signingOut(router);
        } else if (itemValue !== "") {
            router.push(`/${itemValue}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.departmentText}>Department</Text>
            <View style={styles.buttonContainer}>
                {choice.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.button}
                        onPress={() => handleNavigation(item.value)}
                    >
                        <View style={styles.buttonContent}>
                            {item.icon && (
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    size={20}
                                    color="#fff"
                                    style={styles.icon}
                                />
                            )}
                            <Text style={styles.buttonText}>{item.label}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

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
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    departmentText: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    buttonContainer: {
        width: "30%",
        marginTop: 10,
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
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        marginRight: 8,
    },
});
