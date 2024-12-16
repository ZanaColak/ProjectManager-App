import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowRightFromBracket, faChessBoard, faBars, faTimeline, faCalendarDays, faDiagramProject,} from "@fortawesome/free-solid-svg-icons";
import { auth } from "./firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

export default function DepartmentSelection() {
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch user role from Firestore
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setRole(userSnap.data().role || "member"); // Default to "member" if no role
                    } else {
                        console.error("User document not found in Firestore.");
                        setRole("member");
                    }
                } else {
                    console.error("No authenticated user found.");
                    router.replace("/signIn");
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole("member"); // Default to "member" in case of an error
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, []);

    // Choices with admin-only flag
    const choices = [
        { label: "Projekt Leder", value: "", adminOnly: false, icon: faDiagramProject },
        { label: "Kalender", value: "", adminOnly: false, icon: faCalendarDays },
        { label: "Tidslinje", value: "", adminOnly: false, icon: faTimeline },
        { label: "Projekt Indstillinger", value: "", adminOnly: true, icon: faBars },
        { label: "Scrumboard", value: "", adminOnly: false, icon: faChessBoard },
        { label: "Log Ud", value: "signOut", adminOnly: false, icon: faArrowRightFromBracket },
    ];

    const handleNavigation = async (itemValue) => {
        setSelectedDepartment(itemValue);
        if (itemValue === "signOut") {
            await auth.signOut();
            router.replace("/signIn");
        } else if (itemValue !== "") {
            router.push(`/department/${itemValue}`);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#173630" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.departmentText}>Department</Text>
            <View style={styles.buttonContainer}>
                {/* Filter and render choices based on role */}
                {choices
                    .filter((item) => !item.adminOnly || role === "admin") // Filter admin-only options
                    .map((item, index) => (
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
