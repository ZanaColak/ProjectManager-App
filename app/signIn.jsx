import {Text, View, TextInput, StyleSheet, Alert, Button} from "react-native";  // Import Image from react-native
import { useRouter } from "expo-router";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, {useState} from "react";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const signIn = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Sign In Successful");
            const uid = userCredential.user.uid;


            router.push({pathname: "/dashboard", params:{ uid }});
        } catch (error) {
            Alert.alert("Error", error.message);
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
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        <Button title="Sign In" onPress={signIn} color={'#173630'}/>
                    </View>

                </View>
            </View>
            <View style={styles.bottomContainer}>

            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'#fff'
    },

    header: {
        alignItems: 'center',
        width: '80%',
    },

    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#173630',
        marginBottom: 20,
    },

    inputContainer: {
        width: '50%',
        marginBottom: 20,
    },

    input: {
        width: '100%',
        padding: 11,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#ededed',
        color: '#000000',
    },

    buttonContainer: {
        width: '100%',
        borderRadius: 5,
        overflow: 'hidden'
    },

    bottomContainer: {
        width: '100%',
        height: '15%',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#173630',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
