import React, {useState} from "react";
import {ActionSheetIOS, ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useGlobalSearchParams, useRouter} from "expo-router";
import {fetchDepartmentsForUser} from "./services/dataService";
import {Picker} from "@react-native-picker/picker";
import {showAlert} from "./config/utill";

export default function Department() {
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const router = useRouter();
    const {uid, role} = useGlobalSearchParams();
    const {departments, loading, error} = fetchDepartmentsForUser(uid);

    const handleConfirmSelection = () => {
        if (selectedDepartment) {
            router.push({
                pathname: "/dashboard",
                params: {department: selectedDepartment, uid, role},
            });
        } else {
            showAlert("Fejl", "Vælg venligst en afdeling.");
        }
    };

    const openActionSheet = () => {
        if (Platform.OS === "ios") {
            const options = [...departments, "Annuller"];
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex: options.length - 1,
                },
                (buttonIndex) => {
                    if (buttonIndex < departments.length) {
                        setSelectedDepartment(departments[buttonIndex]);
                    }
                }
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#173630"/>
                <Text style={styles.loadingText}>Henter afdelinger...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Kunne ikke hente afdelinger.</Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Vælg afdeling</Text>

            {Platform.OS === "ios" ? (
                <TouchableOpacity style={styles.dropdownContainer} onPress={openActionSheet}>
                    <Text style={styles.pickerText}>
                        {selectedDepartment || "Vælg en afdeling"}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.dropdownContainer}>
                    <Picker
                        selectedValue={selectedDepartment}
                        onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Vælg en afdeling" value=""/>
                        {departments.map((department, index) => (
                            <Picker.Item key={index} label={department} value={department}/>
                        ))}
                    </Picker>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={handleConfirmSelection}>
                <Text style={styles.buttonText}>Bekræft valg</Text>
            </TouchableOpacity>

            <View style={styles.bottomBox}>
                <Text style={styles.boxText}>Copyright © 2024 Novozymes A/S</Text>
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
        paddingTop: Platform.OS === "web" ? 60 : 200,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#333",
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#d9534f",
        textAlign: "center",
    },
    errorMessage: {
        fontSize: 16,
        color: "#555",
        marginTop: 10,
        textAlign: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#173630",
        marginBottom: 15,
        textAlign: "center",
    },
    dropdownContainer: {
        width: "90%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
        padding: Platform.OS === "web" ? 10 : 12,
        marginBottom: 20,
    },
    picker: {
        width: "100%",
        height: Platform.OS === "web" ? 40 : 50,
    },
    pickerText: {
        fontSize: 16,
        color: "#555",
        textAlign: "center",
    },
    button: {
        paddingVertical: 15,
        paddingHorizontal: 40,
        backgroundColor: "#173630",
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    bottomBox: {
        width: Platform.OS === "web" ? "100%" : "120%",
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
