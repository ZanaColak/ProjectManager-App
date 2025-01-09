import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import { fetchDepartments } from "./services/dataService";
import { database } from "./config/firebase";

export default function TeamDetails() {
    const { id, email, role, firstName, lastName, departments } = useGlobalSearchParams();
    const [userEmail, setUserEmail] = useState(email);
    const [userFirstName, setUserFirstName] = useState(firstName);
    const [userLastName, setUserLastName] = useState(lastName);
    const [userDepartments, setUserDepartments] = useState(departments ? departments.split(",").map((dep) => dep.trim()) : []);
    const [userRole, setUserRole] = useState(role);
    const [editingField, setEditingField] = useState("");

    const { departments: availableDepartments, error: departmentError } = fetchDepartments();

    if (departmentError) {
        console.error("Error fetching departments:", departmentError);
    }

    const saveUserDetails = async (field, value) => {
        try {
            const userRef = doc(database, "users", id);
            const updatedValue = field === "departments" ? value : { [field]: value };
            await updateDoc(userRef, field === "departments" ? { departments: value } : updatedValue);
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
                    saveUserDetails("departments", userDepartments.join(", "));
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
                <ScrollView contentContainerStyle={styles.multiSelectContainer}>
                    {availableDepartments.map((dep) => (
                        <TouchableOpacity
                            key={dep.id}
                            style={
                                userDepartments.includes(dep.name)
                                    ? styles.selectedDepartment
                                    : styles.unselectedDepartment
                            }
                            onPress={() => {
                                const updatedDepartments = userDepartments.includes(dep.name)
                                    ? userDepartments.filter((d) => d !== dep.name)
                                    : [...userDepartments, dep.name];

                                setUserDepartments(updatedDepartments);
                                saveUserDetails("departments", updatedDepartments);
                            }}
                        >
                            <Text style={styles.departmentText}>{dep.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>


            {/* Role */}
            <View style={styles.detailContainer}>
                <Text style={styles.label}>Role:</Text>
                <View style={styles.roleOptions}>
                    <TouchableOpacity
                        style={[
                            styles.roleOption,
                            userRole === "admin" && styles.selectedRole,
                        ]}
                        onPress={() => {
                            setUserRole("admin");
                            saveUserDetails("role", "admin");
                        }}
                    >
                        <Text style={styles.roleText}>Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.roleOption,
                            userRole === "member" && styles.selectedRole,
                        ]}
                        onPress={() => {
                            setUserRole("member");
                            saveUserDetails("role", "member");
                        }}
                    >
                        <Text style={styles.roleText}>Member</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
    detailContainer: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: "bold", marginBottom: 5, color: "#333" },
    text: { fontSize: 16, color: "#555", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" },
    input: { fontSize: 16, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff" },
    multiSelectContainer: { flexDirection: "row", flexWrap: "wrap" },
    selectedDepartment: { backgroundColor: "#173630", padding: 8, borderRadius: 5, margin: 5 },
    unselectedDepartment: { backgroundColor: "#ccc", padding: 8, borderRadius: 5, margin: 5 },
    departmentText: { color: "#fff" },
    roleOptions: { flexDirection: "row", justifyContent: "space-around" },
    roleOption: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: "#ccc", marginHorizontal: 5 },
    selectedRole: { backgroundColor: "#173630", borderColor: "#173630" },
    roleText: { color: "#fff", fontSize: 16 },
});
