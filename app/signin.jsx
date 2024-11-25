import { Text, View, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function SignIn() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>

            {/* Username Input */}
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#888"
            />

            {/* Password Input */}
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={true}
            />

            {/* Sign In Button */}
            <Button
                title="Sign In"
                onPress={() => alert("Logged in successfully!")}
                color="#007AFF"
            />

            {/* Back Button */}
            <Button
                title="Back to Home"
                onPress={() => router.push("/")}
                color="#888"
                style={styles.backButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#007AFF",
    },
    input: {
        width: "80%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 10,
        fontSize: 16,
    },
    backButton: {
        marginTop: 20,
    },
});
