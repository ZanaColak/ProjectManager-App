import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  FlatList,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null); // State for selected project to show modal

  // Opret projekt
  const handleCreateProject = () => {
    if (newProjectName && newProjectDescription) {
      const newProject = {
        id: (projects.length + 1).toString(),
        name: newProjectName,
        description: newProjectDescription,
      };
      setProjects([...projects, newProject]);
      setNewProjectName("");
      setNewProjectDescription("");
    } else {
      Alert.alert("Fejl", "Alle felter skal udfyldes.");
    }
  };

  // Rediger projekt
  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
    setNewProjectDescription(project.description);
  };

  // Opdater projekt
  const handleUpdateProject = () => {
    if (newProjectName && newProjectDescription) {
      setProjects(
        projects.map((project) =>
          project.id === editingProject.id
            ? {
                ...project,
                name: newProjectName,
                description: newProjectDescription,
              }
            : project
        )
      );
      setEditingProject(null);
      setNewProjectName("");
      setNewProjectDescription("");
    } else {
      Alert.alert("Fejl", "Alle felter skal udfyldes.");
    }
  };

  // Slet projekt
  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter((project) => project.id !== projectId));
  };

  // Åbn Modal for at vise projektbeskrivelse
  const openProjectDescription = (project) => {
    setSelectedProject(project);
  };

  // Luk Modal
  const closeModal = () => {
    setSelectedProject(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projekter</Text>

      <TextInput
        style={styles.input}
        placeholder="Projekt Navn"
        value={newProjectName}
        onChangeText={setNewProjectName}
      />
      <TextInput
        style={styles.input}
        placeholder="Projekt Beskrivelse"
        value={newProjectDescription}
        onChangeText={setNewProjectDescription}
      />

      {editingProject ? (
        <Button
          title="Opdater Projekt"
          onPress={handleUpdateProject}
          color="#173630"
          style={styles.button}
        />
      ) : (
        <Button
          title="Opret Projekt"
          onPress={handleCreateProject}
          color="#173630"
          style={styles.button}
        />
      )}

      <FlatList
        data={projects}
        renderItem={({ item }) => (
          <View style={styles.projectItem}>
            <TouchableOpacity onPress={() => openProjectDescription(item)}>
              <Text style={styles.projectTitle}>{item.name}</Text>
            </TouchableOpacity>
            <View style={styles.projectActions}>
              <TouchableOpacity onPress={() => handleEditProject(item)}>
                <Text style={styles.actionText}>Rediger</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteProject(item.id)}>
                <Text style={styles.actionText}>Slet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Modal for project description */}
      {selectedProject && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectedProject !== null}
          onRequestClose={closeModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Beskrivelse</Text>
                <Text style={styles.modalDescription}>
                  {selectedProject.description}
                </Text>
                <Button title="Luk" onPress={closeModal} color="#173630" />
              </View>
            </View>
          </TouchableWithoutFeedback>
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
  input: {
    width: "50%", // Holder input felterne på 80% af bredden
    padding: 12,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#ededed",
    color: "#000000",
  },
  projectItem: {
    width: "20%",
    padding: 15,
    marginVertical: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#173630",
  },
  projectActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionText: {
    color: "#173630",
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  // Modal styles
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "50%",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    textAlign: "center",
  },
  button: {
    width: "50%",
    height: 40,
    alignSelf: "center",
    marginVertical: 10,
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "#173630",
  },
});
