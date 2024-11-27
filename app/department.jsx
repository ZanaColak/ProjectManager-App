import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

export default function DepartmentSelection() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const router = useRouter();

  const departments = [
    { label: "Fuglebakken", value: "Fuglebakken" },
    { label: "Bagsværd", value: "Bagsværd" },
    { label: "Kalundborg", value: "Kalundborg" },
  ];

  const handleConfirmSelection = () => {
    if (selectedDepartment) {
      // Navigér til dashboard og send afdeling som parameter
      router.push({
        pathname: "/dashboard",
        params: { department: selectedDepartment },
      });
    } else {
      Alert.alert("Fejl", "Vælg venligst en afdeling.");
    }
  };

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
                <Picker.Item
                    key={index}
                    label={department.label}
                    value={department.value}
                />
            ))}
          </Picker>
        </View>

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
