import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { fetchUsers } from "./services/dataService";
import { addDoc, deleteDoc, updateDoc, doc, collection } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { database } from "./config/firebase";

export default function Team() {
  const { department, role } = useGlobalSearchParams();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("member");
  const [editingUser, setEditingUser] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const router = useRouter();

  const { users, loading, error } = fetchUsers(department);

  const handleError = (message) => {
    router.push({ pathname: "/components/error", params: { message } });
  };

  const createUser = async () => {
    if (userEmail) {
      try {
        await addDoc(collection(database, "users"), {
          email: userEmail,
          role: userRole,
          department,
          createdAt: new Date(),
        });
        setUserEmail("");
        setUserRole("member");
        setShowAdminModal(false);
      } catch (error) {
        handleError("Failed to create user.");
        console.error("Error creating user:", error);
      }
    } else {
      Alert.alert("Error", "All fields must be filled.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteDoc(doc(database, "users", id));
    } catch (error) {
      Alert.alert("Error", "Failed to delete user.");
      console.error("Error deleting user:", error);
    }
  };

  const editUser = (user) => {
    setEditingUser(user);
    setUserEmail(user.email);
    setUserRole(user.role);
    setShowAdminModal(true);
  };

  const updateUser = async () => {
    if (userEmail && editingUser) {
      try {
        const userRef = doc(database, "users", editingUser.id);
        await updateDoc(userRef, {
          email: userEmail,
          role: userRole,
          updatedAt: new Date(),
        });
        setEditingUser(null);
        setUserEmail("");
        setUserRole("member");
        setShowAdminModal(false);
      } catch (error) {
        Alert.alert("Error", "Failed to update user.");
        console.error("Error updating user:", error);
      }
    } else {
      Alert.alert("Error", "All fields must be filled.");
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.header}>Team - {department}</Text>

        {role === "admin" && (
            <TouchableOpacity style={styles.adminIcon} onPress={() => setShowAdminModal(true)}>
              <Icon name="plus-circle" size={30} color="#173630" />
            </TouchableOpacity>
        )}

        {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#173630" />
              <Text>Loading Users...</Text>
            </View>
        )}

        {error && <Text style={styles.errorText}>Error loading users.</Text>}

        <ScrollView style={styles.list}>
          {users.map((user) => (
              <View style={styles.userItemContainer} key={user.id}>
                <View style={styles.userItem}>
                  <Text style={styles.userText}>{user.email}</Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </View>

                {role === "admin" && (
                    <>
                      <TouchableOpacity
                          onPress={() => editUser(user)}
                          style={styles.editButton}
                      >
                        <Icon name="edit" size={24} color="#000" />
                      </TouchableOpacity>
                      <TouchableOpacity
                          onPress={() => deleteUser(user.id)}
                          style={styles.deleteButton}
                      >
                        <Icon name="trash" size={24} color="#000" />
                      </TouchableOpacity>
                    </>
                )}
              </View>
          ))}
        </ScrollView>

        {role === "admin" && (
            <Modal visible={showAdminModal} animationType="slide" transparent>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TextInput
                      style={styles.input}
                      placeholder="User Email"
                      value={userEmail}
                      onChangeText={setUserEmail}
                  />
                  <TextInput
                      style={styles.input}
                      placeholder="User Role"
                      value={userRole}
                      onChangeText={setUserRole}
                  />
                  <TouchableOpacity
                      style={styles.addButton}
                      onPress={editingUser ? updateUser : createUser}
                  >
                    <Text style={styles.addButtonText}>{editingUser ? "Update" : "Create"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowAdminModal(false);
                        setEditingUser(null);
                        setUserEmail("");
                        setUserRole("member");
                      }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
        )}
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
  adminIcon: {
    alignSelf: "flex-end",
    marginRight: 20,
    marginBottom: 10,
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
  userRole: {
    fontSize: 12,
    color: "#999",
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
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
});
