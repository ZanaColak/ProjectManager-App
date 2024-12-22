import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Button,
  TextInput,
  Modal,
  Picker,
} from "react-native";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from "./services/dataService";
import { useGlobalSearchParams } from "expo-router";

export default function Team() {
  const { department } = useGlobalSearchParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("member");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Tjek for brugerens rolle
    const fetchUserRole = async () => {
      const userRole = "admin"; // Hent brugerens rolle fra firebase auth
      setIsAdmin(userRole === "admin");
    };
    fetchUserRole();
  }, []);

  const { users, loading, error } = fetchUsers(department);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#173630" />
        <Text>Henter brugere...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Der opstod en fejl ved indlæsning af brugere.</Text>
        <Text>{error?.message || "Ukendt fejl"}</Text>
      </View>
    );
  }

  const handleAddUser = async () => {
    if (!isAdmin) {
      console.error("Kun admins kan tilføje brugere.");
      return;
    }

    try {
      if (editingUser) {
        await updateUser(department, editingUser.id, newUserEmail, newUserRole);
        console.log("Bruger opdateret");
      } else {
        await addUser(department, newUserEmail, newUserRole);
        console.log("Bruger tilføjet");
      }
      setIsModalVisible(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("member");
      setEditingUser(null);
    } catch (error) {
      console.error("Fejl ved handling på bruger:", error);
    }
  };

  const handleEditUser = (user) => {
    if (!isAdmin) {
      console.error("Kun admins kan redigere brugere.");
      return;
    }

    setEditingUser(user);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin) {
      console.error("Kun admins kan slette brugere.");
      return;
    }

    try {
      await deleteUser(department, userId);
      console.log("Bruger slettet");
    } catch (error) {
      console.error("Fejl ved sletning af bruger:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Hold - {department}</Text>

      <ScrollView style={styles.list}>
        {users.map((user) => (
          <View style={styles.userItem} key={user.id}>
            <Text style={styles.userText}>{user.email}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
            {isAdmin && (
              <View style={styles.adminActions}>
                <Button title="Rediger" onPress={() => handleEditUser(user)} />
                <Button
                  title="Slet"
                  color="red"
                  onPress={() => handleDeleteUser(user.id)}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      {isAdmin && (
        <Button title="Tilføj bruger" onPress={() => setIsModalVisible(true)} />
      )}

      {isModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>
                {editingUser ? "Rediger bruger" : "Tilføj ny bruger"}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
              />
              {!editingUser && (
                <TextInput
                  style={styles.input}
                  placeholder="Adgangskode"
                  secureTextEntry
                  value={newUserPassword}
                  onChangeText={setNewUserPassword}
                />
              )}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Vælg rolle:</Text>
                <Picker
                  selectedValue={newUserRole}
                  onValueChange={(itemValue) => setNewUserRole(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Member" value="member" />
                </Picker>
              </View>
              <View style={styles.modalActions}>
                <Button
                  title="Annuller"
                  onPress={() => {
                    setIsModalVisible(false);
                    setEditingUser(null);
                  }}
                />
                <Button
                  title={editingUser ? "Opdater" : "Tilføj"}
                  onPress={handleAddUser}
                />
              </View>
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
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  list: {
    width: "100%",
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  userText: {
    fontSize: 16,
    color: "#173630",
  },
  userRole: {
    fontSize: 14,
    color: "#666",
  },
  adminActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%",
    marginBottom: 10,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  picker: {
    height: 40,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
