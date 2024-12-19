import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { fetchUsers } from "./services/dataService";
import { useGlobalSearchParams } from "expo-router";

export default function Team() {
  const { department } = useGlobalSearchParams();

  useEffect(() => {
    console.log("Department:", department);
  }, [department]);

  const { users, loading, error } = fetchUsers(department);

  // Håndter loading-tilstand
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#173630" />
        <Text>Henter brugere...</Text>
      </View>
    );
  }

  // Håndter fejl
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Der opstod en fejl ved indlæsning af brugere.</Text>
        <Text>{error.message}</Text> {/* Vis fejlinformation */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Hold - {department}</Text>

      <ScrollView style={styles.list}>
        {users.map((user) => (
          <View style={styles.userItem} key={user.id}>
            <Text style={styles.userText}>{user.email}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        ))}
      </ScrollView>
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
  noUsersText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
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
});
