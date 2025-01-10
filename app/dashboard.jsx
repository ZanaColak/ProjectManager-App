import React, { useState } from "react";
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Platform} from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChessBoard, faBars, faTimeline, faDiagramProject } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
  const router = useRouter();
  const { uid, role, department } = useGlobalSearchParams();
  const [loading] = useState(false);

  const choices = [
    { label: "Projekter", value: "project", adminOnly: false, icon: faDiagramProject },
    { label: "Tidslinje", value: "timeline", adminOnly: false, icon: faTimeline },
    { label: "Hold", value: "team", adminOnly: false, icon: faBars },
    { label: "Scrum board", value: "scrumBoard", adminOnly: false, icon: faChessBoard },
  ];

  const handleNavigation = (itemValue) => {
    if (itemValue) {
      router.push({
        pathname: `/${itemValue}`,
        params: { uid, role, department } });
    }
  };

  return (
      <View style={styles.container}>
        {loading ? (
            <ActivityIndicator size="large" color="#173630" />
        ) : (
            <>
              <Text style={styles.title}>Dashboard - {department}</Text>
              <ScrollView style={styles.buttonContainer}>
                {choices
                    .filter((item) => !item.adminOnly || role === "admin")
                    .map((item, index) => (
                        <TouchableOpacity key={index} style={styles.button} onPress={() => handleNavigation(item.value)}>
                          <FontAwesomeIcon icon={item.icon} size={24} color="#fff" style={styles.icon} />
                          <Text style={styles.buttonText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
              </ScrollView>
              <View style={styles.bottomBox}>
                <Text style={styles.boxText}>Copyright © 2024 Novozymes A/S</Text>
              </View>
            </>
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#173630",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  bottomBox: {
    width:  Platform.OS === "web" ? "100%" : "120%",
    height: 60,
    backgroundColor: "#173630",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
  },
  boxText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
  },
});
