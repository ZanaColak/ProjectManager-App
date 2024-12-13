import React, { useState } from "react";
import {Text, View, TextInput, StyleSheet, Button, Modal, TouchableOpacity, Keyboard} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUserRole, ensureDefaultRole } from "./firebase";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
          auth, email, password);

      const uid = userCredential.user.uid;

      // Ensure user has a role in Firestore (create if missing)
      await ensureDefaultRole(uid, userCredential.user.email);

      // Fetch the role from Firestore
      const role = await getUserRole(uid);


      if (role === "admin") {
        router.push({
          pathname: "/department",
          params: { uid },
        });
      } else if (role === "member") {
        router.push({
          pathname: "/department",
          params: { uid },
        });
      } else {
        throw new Error("Invalid role detected. Contact support.");
      }

      setShowErrorModal(false);
    } catch (error) {
      console.error("Sign-in error:", error);
      const errorMessages = {
        "auth/user-not-found": "Ingen bruger fundet på denne email.",
        "auth/wrong-password": "Din kode er angivet forkert.",
      };
      setErrorMessage(
          errorMessages[error.code] || "Noget gik galt. Prøv igen."
      );
      setShowErrorModal(true);
    }
  };

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.text}>Sign In</Text>

          <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => this.passwordInput?.focus()}
            />

            <TextInput
                ref={(input) => {
                  this.passwordInput = input;
                }}
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  signIn();
                }}
            />

            <View style={styles.buttonContainer}>
              <Button title="Sign In" onPress={signIn} color="#173630" />
            </View>
          </View>
        </View>

        {/* Error Modal */}
        <Modal
            transparent
            visible={showErrorModal}
            animationType="slide"
            onRequestClose={() => setShowErrorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.modalButtonText}>Luk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    width: "80%",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#173630",
    marginBottom: 20,
  },
  inputContainer: {
    width: "50%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 11,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#ededed",
    color: "#000000",
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#173630",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
