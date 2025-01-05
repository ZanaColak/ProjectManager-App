import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { collection, doc, getDoc } from "firebase/firestore";
import { database } from "./config/firebase";

export default function Department() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { uid, role } = useGlobalSearchParams();

  // Fetch accessible departments from Firestore
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const userRef = doc(database, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const allowedDepartments = userSnap.data().departments || []; // Array of accessible departments
          setDepartments(allowedDepartments.map((dep) => ({ label: dep, value: dep })));
        } else {
          console.error("User not found in Firestore.");
          showAlert("Fejl", "Brugerdata ikke fundet.");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        showAlert("Fejl", "Kunne ikke hente afdelinger.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [uid]);

  const handleConfirmSelection = () => {
    if (selectedDepartment) {
      router.push({
        pathname: "/dashboard",
        params: { department: selectedDepartment, uid, role },
      });
    } else {
      showAlert("Fejl", "Vælg venligst en afdeling.");
    }
  };

  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      alert(`${title}: ${message}`); // Basic alert for web
    } else {
      Alert.alert(title, message); // Mobile-specific alert
    }
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#173630" />
          <Text>Henter afdelinger...</Text>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Vælg afdeling</Text>

        <View style={styles.dropdownContainer}>
          <Picker
              selectedValue={selectedDepartment}
              onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
              style={styles.picker}
          >
            <Picker.Item label="Vælg en afdeling" value="" />
            {departments.map((department, index) => (
                <Picker.Item key={index} label={department.label} value={department.value} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleConfirmSelection}>
          <Text style={styles.buttonText}>Bekræft valg</Text>
        </TouchableOpacity>

        {selectedDepartment ? (
            <Text style={styles.selectionText}>Du har valgt: {selectedDepartment}</Text>
        ) : null}

        <View style={styles.bottomBox}>
          <Text style={styles.boxText}>Copyright © 2024 Novozymes A/S, part of Novonesis Group</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  dropdownContainer: {
    width: "100%",
    maxWidth: 350,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  picker: {
    width: "100%",
    height: 50,
  },
  selectionText: {
    marginTop: 20,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
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
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
});
