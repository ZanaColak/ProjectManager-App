import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, ActionSheetIOS,} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { fetchDepartments } from "./services/dataService";
import { Picker } from "@react-native-picker/picker"; // Correctly import Picker

export default function Department() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const router = useRouter();
  const { uid, role } = useGlobalSearchParams();

  // Fetch departments dynamically
  const { departments, loading, error } = fetchDepartments();

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

  const openActionSheet = () => {
    if (Platform.OS === "ios") {
      const options = departments.map((department) => department.name);
      options.push("Annuller");

      ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: options.length - 1,
          },
          (buttonIndex) => {
            if (buttonIndex < departments.length) {
              setSelectedDepartment(departments[buttonIndex].name);
            }
          }
      );
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

  if (error) {
    return (
        <View style={styles.errorContainer}>
          <Text>Kunne ikke hente afdelinger.</Text>
          <Text>{error.message}</Text>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Vælg afdeling</Text>

        {Platform.OS === "ios" ? (
            <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={openActionSheet}
            >
              <Text style={styles.pickerText}>
                {selectedDepartment || "Vælg en afdeling"}
              </Text>
            </TouchableOpacity>
        ) : (
            <View style={styles.dropdownContainer}>
              <Picker
                  selectedValue={selectedDepartment}
                  onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
                  style={styles.picker}
              >
                <Picker.Item label="Vælg en afdeling" value="" />
                {departments.map((department, index) => (
                    <Picker.Item
                        key={index}
                        label={department.name}
                        value={department.name}
                    />
                ))}
              </Picker>
            </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleConfirmSelection}>
          <Text style={styles.buttonText}>Bekræft valg</Text>
        </TouchableOpacity>

        {selectedDepartment ? (
            <Text style={styles.selectionText}>
              Du har valgt: {selectedDepartment}
            </Text>
        ) : null}

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
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    width: "100%",
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
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
