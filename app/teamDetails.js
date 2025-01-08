 import React, { useState } from "react";
    import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Picker } from "react-native";
    import { useGlobalSearchParams } from "expo-router";
    import { doc, updateDoc } from "firebase/firestore";
    import { database } from "./config/firebase";

    export default function TeamDetails() {
        const { id, email, role, firstName, lastName, departments } = useGlobalSearchParams();
        const [userEmail, setUserEmail] = useState(email);
        const [userFirstName, setUserFirstName] = useState(firstName);
        const [userLastName, setUserLastName] = useState(lastName);
        const [userDepartments, setUserDepartments] = useState(departments.split(", "));
        const [userRole, setUserRole] = useState(role);
        const [editingField, setEditingField] = useState("");

        const saveUserDetails = async (field, value) => {
            try {
                const userRef = doc(database, "users", id);
                await updateDoc(userRef, { [field]: value });
                Alert.alert("Success", `${field} updated successfully.`);
            } catch (error) {
                Alert.alert("Error", `Failed to update ${field}.`);
                console.error(`Error updating ${field}:`, error);
            }
        };

        const toggleEdit = (field) => {
            if (editingField === field) {
                switch (field) {
                    case "email":
                        saveUserDetails("email", userEmail);
                        break;
                    case "firstName":
                        saveUserDetails("firstName", userFirstName);
                        break;
                    case "lastName":
                        saveUserDetails("lastName", userLastName);
                        break;
                    case "departments":
                        saveUserDetails("departments", userDepartments);
                        break;
                    case "role":
                        saveUserDetails("role", userRole);
                        break;
                    default:
                        break;
                }
                setEditingField("");
            } else {
                setEditingField(field);
            }
        };

        return (
            <View style={styles.container}>
                <Text style={styles.header}>User Details</Text>

                {/* First Name */}
                <View style={styles.detailContainer}>
                    <Text style={styles.label}>First Name:</Text>
                    {editingField === "firstName" ? (
                        <TextInput
                            style={styles.input}
                            value={userFirstName}
                            onChangeText={setUserFirstName}
                            onBlur={() => toggleEdit("firstName")}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => toggleEdit("firstName")}>
                            <Text style={styles.text}>{userFirstName}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Last Name */}
                <View style={styles.detailContainer}>
                    <Text style={styles.label}>Last Name:</Text>
                    {editingField === "lastName" ? (
                        <TextInput
                            style={styles.input}
                            value={userLastName}
                            onChangeText={setUserLastName}
                            onBlur={() => toggleEdit("lastName")}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => toggleEdit("lastName")}>
                            <Text style={styles.text}>{userLastName}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Email */}
                <View style={styles.detailContainer}>
                    <Text style={styles.label}>Email:</Text>
                    {editingField === "email" ? (
                        <TextInput
                            style={styles.input}
                            value={userEmail}
                            onChangeText={setUserEmail}
                            onBlur={() => toggleEdit("email")}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => toggleEdit("email")}>
                            <Text style={styles.text}>{userEmail}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Departments */}
                <View style={styles.detailContainer}>
                    <Text style={styles.label}>Departments:</Text>
                    {editingField === "departments" ? (
                        <TextInput
                            style={styles.input}
                            value={userDepartments.join(", ")}
                            onChangeText={(value) => setUserDepartments(value.split(", "))}
                            onBlur={() => toggleEdit("departments")}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => toggleEdit("departments")}>
                            <Text style={styles.text}>{userDepartments.join(", ")}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Role */}
                <View style={styles.detailContainer}>
                    <Text style={styles.label}>Role:</Text>
                    {editingField === "role" ? (
                        <Picker
                            selectedValue={userRole}
                            style={styles.picker}
                            onValueChange={(value) => setUserRole(value)}
                            onBlur={() => toggleEdit("role")}
                        >
                            <Picker.Item label="Admin" value="admin" />
                            <Picker.Item label="Member" value="member" />
                        </Picker>
                    ) : (
                        <TouchableOpacity onPress={() => toggleEdit("role")}>
                            <Text style={styles.text}>{userRole}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
        header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
        detailContainer: { marginBottom: 20 },
        label: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#333" },
        text: { fontSize: 16, color: "#555", paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" },
        input: { fontSize: 16, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" },
        picker: { height: 50, width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 5 },
    });
