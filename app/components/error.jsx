import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";

export default function Error() {
    const router = useRouter();
    const { message } = useGlobalSearchParams();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.message}>{message || "An unexpected error occurred."}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => router.back()}
            >
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace("/")}
            >
                <Text style={styles.homeButtonText}>Go to Home</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "#f8f9fa",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#173630",
        borderRadius: 5,
        marginBottom: 10,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    homeButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#d9534f",
        borderRadius: 5,
    },
    homeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
