import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native"; // Import Image from react-native
import { useRouter } from "expo-router";
import React from "react";

export default function SignIn() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with logo and title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Proceed to Dashboard</Text>
      </View>

      {/* Background image under all content */}
      {/* Input fields */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
      />

      {/* Buttons */}
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => alert("Logged in successfully!")}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#bfe6c4", // Background color for the container
    paddingHorizontal: 20,
    position: "relative",
  },
  backgroundImage: {
    width: "100%", // Full width
    height: 400, // Full height (same size as current image)
    resizeMode: "cover", // Ensure images cover the space without distortion
    position: "absolute", // Ensure images overlap each other
  },
  backgroundImageStyle: {
    resizeMode: "cover", // Ensures the image covers the entire area and is cropped if needed
  },
  header: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 40,
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "black",
    position: "absolute",
    left: "43%",
    transform: [{ translateX: -75 }],
    opacity: 0.7,
    textTransform: "uppercase",
  },
  logo: {
    width: 100,
    height: 80,
  },
  input: {
    width: "40%", // Set the input width to 40% of the screen width
    height: 45, // Make the height more compact
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    fontSize: 16,
    alignSelf: "center", // Centers the input field horizontally
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Add transparency to make the inputs stand out on top of the background
  },
  buttonContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#888",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
  },
});
