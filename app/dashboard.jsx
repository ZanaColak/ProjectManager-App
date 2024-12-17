import React, { useState, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { database, auth } from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChessBoard, faBars, faTimeline, faCalendarDays, faDiagramProject,} from "@fortawesome/free-solid-svg-icons";
import {router} from "expo-router";

export default function DepartmentSelection({ navigation }) {
    const [role, setRole] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [loading, setLoading] = useState(true);

    const choices = [
        { label: "Projekt Leder", value: "leader", adminOnly: false, icon: faDiagramProject },
        { label: "Kalender", value: "calendar", adminOnly: false, icon: faCalendarDays },
        { label: "Tidslinje", value: "timeline", adminOnly: false, icon: faTimeline },
        { label: "Projekt Indstillinger", value: "settings", adminOnly: true, icon: faBars },
        { label: "Scrumboard", value: "scrumboard", adminOnly: false, icon: faChessBoard },
    ];

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userRef = doc(database, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setRole(userSnap.data().role || "member");
                    } else {
                        console.error("User document not found");
                        setRole("member");
                    }
                } else {
                    console.error("No authenticated user");
                    navigation.replace("SignIn");
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole("member");
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#173630" />
            </View>
        );
    }

    const handleNavigation = (itemValue) => {
        setSelectedDepartment(itemValue);
        if (itemValue !== "") {
            router.push(`/${itemValue}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Department</Text>
            <ScrollView style={styles.buttonContainer}>
                {choices.filter((item) => !item.adminOnly || role === "admin").map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.button}
                            onPress={() => handleNavigation(item.value)}
                        >
                            <FontAwesomeIcon
                                icon={item.icon}
                                size={24}
                                color="#fff"
                                style={styles.icon}
                            />
                            <Text style={styles.buttonText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
            </ScrollView>
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2024 Novozymes A/S, part of Novonesis Group</Text>
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
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
    },
    buttonContainer: {
        width: "100%",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginVertical: 10,
        backgroundColor: "#173630",
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginLeft: 10,
    },
    icon: {
        marginRight: 10,
    },
    footer: {
        position: "absolute",
        bottom: 20,
    },
    footerText: {
        color: "#333",
        fontSize: 12,
    },
});
