import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Button, Modal, TouchableOpacity, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { signIn } from "./components/signIn";

export default function Index() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);
    const router = useRouter();

    const signingIn = async () => {
        await signIn(email, password, (uid, role) => {
                router.push({ pathname: "/department", params: { uid, role } });
            },
            (error) => {
                setErrorMessage(error);
                setShowErrorModal(true);
            }
        );
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
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    <View style={styles.buttonContainer}>
                        <Button title="Sign In" onPress={signingIn} color="#173630" />
                    </View>
                </View>
            </View>
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
                            <Text style={styles.modalButtonText}>Close</Text>
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
