import React, { useRef, useState } from "react";
import { ActionSheetIOS, Keyboard, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { signIn } from "./components/signIn";

export default function Index() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorModal, setShowErrorModal] = useState(false);
    const passwordInputRef = useRef(null);
    const router = useRouter();

    const signingIn = async () => {
        await signIn(email, password, (uid, role) => {
            router.push({ pathname: "/department", params: { uid, role } });
        }, (error) => {
            setErrorMessage(error);

            if (Platform.OS === "ios") {
                ActionSheetIOS.showActionSheetWithOptions(
                    { options: ["Close", error], cancelButtonIndex: 0 },
                    (buttonIndex) => {
                        if (buttonIndex === 0) setShowErrorModal(false);
                    }
                );
            } else {
                setShowErrorModal(true);
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.box, Platform.OS === "web" ? styles.webBox : styles.iosBox]}>
                <Text style={styles.title}>Sign In</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                    <TextInput
                        ref={passwordInputRef}
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    <TouchableOpacity style={styles.button} onPress={signingIn}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {Platform.OS !== "ios" && (
                <Modal transparent visible={showErrorModal} animationType="slide" onRequestClose={() => setShowErrorModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalText}>{errorMessage}</Text>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setShowErrorModal(false)}>
                                <Text style={styles.modalButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 20,
    },
    box: {
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    webBox: {
        width: "40%",
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    iosBox: {
        width: "80%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#173630",
        marginBottom: 20,
    },
    inputContainer: {
        width: "100%",
    },
    input: {
        width: "100%",
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#fff",
        borderColor: "#ccc",
        marginBottom: 15,
        fontSize: 16,
        color: "#333",
    },
    button: {
        backgroundColor: "#173630",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: Platform.OS === "web" ? 0.1 : 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
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
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
        lineHeight: 22,
    },
    modalButton: {
        backgroundColor: "#173630",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
