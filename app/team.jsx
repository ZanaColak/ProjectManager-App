import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { fetchUsers, fetchDepartments } from "./services/dataService";
import { createUser, deleteUser } from "./services/teamService";
import Icon from "react-native-vector-icons/FontAwesome";

export default function Team() {
    const { department, role } = useGlobalSearchParams();
    const router = useRouter();
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userRole, setUserRole] = useState("member");
    const [userDepartments, setUserDepartments] = useState([]);
    const { users, loading, error } = fetchUsers(department);
    const { departments } = fetchDepartments();

    const admins = users.filter((user) => user.role === "admin");
    const members = users.filter((user) => user.role === "member");

    const handleCreateUser = async () => {
        const userData = {
            firstName,
            lastName,
            email,
            password,
            userRole,
            userDepartments,
        };

        await createUser(userData, () => {
            setFirstName("");
            setLastName("");
            setEmail("");
            setPassword("");
            setUserRole("member");
            setUserDepartments([]);
            setShowCreationModal(false);
        });
    };

    const handleDeleteUser = async (id) => {
        await deleteUser(id);
    };

    const navigateToDetails = (user) => {
        router.push({
            pathname: "/teamDetails",
            params: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                departments: user.departments.join(", "),
            },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Team - {department}</Text>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#173630" />
                    <Text>Loading Users...</Text>
                </View>
            )}
            {error && <Text style={styles.errorText}>Error loading users.</Text>}

            <ScrollView style={styles.list}>
                <Text style={styles.sectionHeader}>Admins</Text>
                {admins.map((user) => (
                    <TouchableOpacity key={user.id} onPress={() => navigateToDetails(user)}>
                        <View style={styles.userItemContainer}>
                            <View style={styles.userItem}>
                                <Text style={styles.userText}>
                                    {user.firstName} {user.lastName}
                                </Text>
                                <Text style={styles.userDepartments}>{user.departments.join(", ")}</Text>
                            </View>
                            {role === "admin" && (
                                <TouchableOpacity onPress={() => handleDeleteUser(user.id)} style={styles.deleteButton}>
                                    <Icon name="trash" size={24} color="#000" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}

                <Text style={styles.sectionHeader}>Members</Text>
                {members.map((user) => (
                    <TouchableOpacity key={user.id} onPress={() => navigateToDetails(user)}>
                        <View style={styles.userItemContainer}>
                            <View style={styles.userItem}>
                                <Text style={styles.userText}>
                                    {user.firstName} {user.lastName}
                                </Text>
                                <Text style={styles.userDepartments}>{user.departments.join(", ")}</Text>
                            </View>
                            {role === "admin" && (
                                <TouchableOpacity onPress={() => handleDeleteUser(user.id)} style={styles.deleteButton}>
                                    <Icon name="trash" size={24} color="#000" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {role === "admin" && (
                <TouchableOpacity style={styles.addIcon} onPress={() => setShowCreationModal(true)}>
                    <Icon name="plus-circle" size={50} color="#173630" />
                </TouchableOpacity>
            )}

            <Modal visible={showCreationModal} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <TextInput
                                style={styles.input}
                                placeholder="First Name"
                                placeholderTextColor="#999"
                                value={firstName}
                                onChangeText={setFirstName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Last Name"
                                placeholderTextColor="#999"
                                value={lastName}
                                onChangeText={setLastName}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            <View style={styles.roleContainer}>
                                <Text style={styles.label}>Role:</Text>
                                <View style={styles.roleOptions}>
                                    <TouchableOpacity
                                        style={[styles.roleOption, userRole === "admin" && styles.selectedRole]}
                                        onPress={() => setUserRole("admin")}
                                    >
                                        <Text style={[styles.roleText, userRole === "admin" && styles.selectedRoleText]}>Admin</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.roleOption, userRole === "member" && styles.selectedRole]}
                                        onPress={() => setUserRole("member")}
                                    >
                                        <Text style={[styles.roleText, userRole === "member" && styles.selectedRoleText]}>Member</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.multiSelectContainer}>
                                {departments.map((dep) => (
                                    <TouchableOpacity
                                        key={dep.id}
                                        style={userDepartments.includes(dep.name) ? styles.selectedDepartment : styles.unselectedDepartment}
                                        onPress={() =>
                                            setUserDepartments((prev) =>
                                                prev.includes(dep.name) ? prev.filter((d) => d !== dep.name) : [...prev, dep.name]
                                            )
                                        }
                                    >
                                        <Text style={styles.departmentText}>{dep.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TouchableOpacity style={styles.addButton} onPress={handleCreateUser}>
                                <Text style={styles.addButtonText}>Create</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreationModal(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "ios" ? 70 : 80,
    },
    header: {
        fontSize: Platform.OS === "ios" ? 28 : 26,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#173630",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#d9534f",
        textAlign: "center",
        marginBottom: 20,
        fontSize: 16,
    },
    list: {
        flex: 1,
        marginTop: Platform.OS === "web" ? 10 : 15,
    },
    sectionHeader: {
        fontSize: Platform.OS === "ios" ? 22 : 20,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
        color: "#173630",
    },
    userItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: Platform.OS === "ios" ? "#bbb" : "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
        shadowColor: Platform.OS === "ios" ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: Platform.OS === "ios" ? 0.2 : 0,
        shadowRadius: 4,
        elevation: Platform.OS === "web" ? 2 : 5,
    },
    userItem: {
        flex: 1,
    },
    userText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#173630",
    },
    userDepartments: {
        fontSize: 12,
        color: "#999",
    },
    deleteButton: {
        marginLeft: 10,
    },
    addIcon: {
        position: "absolute",
        bottom: 30,
        right: 30,
        shadowColor: Platform.OS === "ios" ? "#000" : "transparent",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: Platform.OS === "ios" ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: Platform.OS === "web" ? 3 : 6,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Platform.OS === "ios" ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: Platform.OS === "ios" ? "85%" : "90%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    input: {
        width: "100%",
        padding: 14,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#f5f5f5",
        color: "#333",
        fontSize: 16,
        borderColor: "#ccc",
    },
    multiSelectContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 15,
    },
    selectedDepartment: {
        backgroundColor: "#173630",
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    unselectedDepartment: {
        backgroundColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        margin: 5,
    },
    departmentText: {
        color: "#fff",
        fontSize: 14,
    },
    addButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: "#173630",
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    addButtonText: {
        color: "#fff",
        fontSize: Platform.OS === "ios" ? 16 : 15,
        fontWeight: "bold",
    },
    cancelButton: {
        marginTop: 15,
        paddingVertical: 12,
        paddingHorizontal: 25,
        backgroundColor: "#d9534f",
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontSize: Platform.OS === "ios" ? 16 : 15,
        fontWeight: "bold",
    },
    roleContainer: {
        marginBottom: 20,
        width: "100%",
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    roleOptions: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    roleOption: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: "#ccc",
        marginHorizontal: 5,
    },
    selectedRole: {
        backgroundColor: "#173630",
        borderColor: "#173630",
    },
    roleText: {
        color: "black",
        fontSize: 14,
    },
    selectedRoleText: {
        color: "white",
    },
});


