import React, {useState} from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import {useRouter, useGlobalSearchParams} from "expo-router";
import {fetchUsers, fetchDepartments} from "./services/dataService";
import {deleteDoc, doc, setDoc} from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import {database, auth} from "./config/firebase";
import {createUserWithEmailAndPassword} from "firebase/auth";

export default function Team() {
    const {department, role} = useGlobalSearchParams();
    const router = useRouter();
    const [showCreationModal, setShowCreationModal] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userRole, setUserRole] = useState("member");
    const [userDepartments, setUserDepartments] = useState([]);
    const {users, loading, error} = fetchUsers(department);
    const {departments} = fetchDepartments();

    const handleError = (message) => Alert.alert("Error", message);

    const createUser = async () => {
        if (firstName && lastName && email && password.length >= 6 && userDepartments.length > 0) {
            try {

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const userId = userCredential.user.uid;

                const userRef = doc(database, "users", userId);
                await setDoc(userRef, {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    role: userRole,
                    departments: userDepartments,
                    createdAt: new Date(),
                });

                setFirstName("");
                setLastName("");
                setEmail("");
                setPassword("");
                setUserRole("member");
                setUserDepartments([]);
                setShowCreationModal(false);
                Alert.alert("Success", "User created successfully.");

            } catch (error) {
                console.error("Error creating user:", error);
                Alert.alert("Error", `Failed to create user: ${error.message}`);
            }
        } else {
            Alert.alert("Error", "All fields must be filled, and password must be at least 6 characters long.");
        }
    };


    const deleteUser = async (id) => {
        try {
            await deleteDoc(doc(database, "users", id));
            Alert.alert("Success", "User deleted successfully.");

        } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", `Failed to delete user: ${error.message}`);
        }
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

    const admins = users.filter((user) => user.role === "admin");
    const members = users.filter((user) => user.role === "member");

    return (
        <View style={styles.container}>

            <Text style={styles.header}>Team - {department}</Text>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#173630"/>
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
                                <Text style={styles.userText}>{user.firstName} {user.lastName}</Text>
                                <Text style={styles.userDepartments}>{user.departments.join(", ")}</Text>
                            </View>

                            {role === "admin" && (
                                <TouchableOpacity onPress={() => deleteUser(user.uid)} style={styles.deleteButton}>
                                    <Icon name="trash" size={24} color="#000"/>
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
                                <Text style={styles.userText}>{user.firstName} {user.lastName}</Text>
                                <Text style={styles.userDepartments}>{user.departments.join(", ")}</Text>
                            </View>

                            {role === "admin" && (
                                <TouchableOpacity onPress={() => deleteUser(user.id)} style={styles.deleteButton}>
                                    <Icon name="trash" size={24} color="#000"/>
                                </TouchableOpacity>
                            )}

                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {role === "admin" && (
                <TouchableOpacity style={styles.addIcon} onPress={() => setShowCreationModal(true)}>
                    <Icon name="plus-circle" size={50} color="#173630"/>
                </TouchableOpacity>
            )}

            <Modal visible={showCreationModal} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        <ScrollView>
                            <TextInput style={styles.input}
                                       placeholder="First Name"
                                       value={firstName}
                                       onChangeText={setFirstName}
                            />
                            <TextInput style={styles.input}
                                       placeholder="Last Name"
                                       value={lastName}
                                       onChangeText={setLastName}
                            />
                            <TextInput style={styles.input}
                                       placeholder="Email"
                                       value={email}
                                       onChangeText={setEmail}
                            />
                            <TextInput style={styles.input}
                                       placeholder="Password"
                                       secureTextEntry value={password}
                                       onChangeText={setPassword}
                            />
                            <View style={styles.roleContainer}>
                                <Text style={styles.label}>Role:</Text>
                                <View style={styles.roleOptions}>

                                    <TouchableOpacity
                                        style={[styles.roleOption, userRole === "admin" && styles.selectedRole]}
                                        onPress={() => setUserRole("admin")}
                                    >
                                        <Text style={styles.roleText}>Admin</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.roleOption, userRole === "member" && styles.selectedRole]}
                                        onPress={() => setUserRole("member")}
                                    >
                                        <Text style={styles.roleText}>Member</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>

                            <View style={styles.multiSelectContainer}>
                                {departments.map((dep) => (
                                    <TouchableOpacity
                                        key={dep.id}
                                        style={userDepartments.includes(dep.name) ? styles.selectedDepartment : styles.unselectedDepartment}
                                        onPress={() => setUserDepartments((prev) =>
                                            prev.includes(dep.name) ? prev.filter((d) => d !== dep.name) : [...prev, dep.name]
                                        )}
                                    >
                                        <Text style={styles.departmentText}>{dep.name}</Text>
                                    </TouchableOpacity>
                                ))}

                            </View>

                            <TouchableOpacity style={styles.addButton} onPress={createUser}>
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
        paddingTop: 80,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 20,
    },
    list: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
        color: "#333",
    },
    userItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    userItem: {
        flex: 1,
    },
    userText: {
        fontSize: 16,
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
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "90%",
        padding: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        alignItems: "center",
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: "#ededed",
        color: "#000",
    },
    multiSelectContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 10,
    },
    selectedDepartment: {
        backgroundColor: "#173630",
        padding: 8,
        borderRadius: 5,
        margin: 5,
    },
    unselectedDepartment: {
        backgroundColor: "#ccc",
        padding: 8,
        borderRadius: 5,
        margin: 5,
    },
    departmentText: {
        color: "#fff",
    },
    addButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#173630",
        borderRadius: 5,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    cancelButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#d9534f",
        borderRadius: 5,
    },
    cancelButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    roleContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
    },
    roleOptions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    roleOption: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#ccc",
        marginHorizontal: 5,
    },
    selectedRole: {
        backgroundColor: "#173630",
        borderColor: "#173630",
    },
    roleText: {
        color: "#fff",
        fontSize: 16,
    },
});
