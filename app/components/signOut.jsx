import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Platform} from "react-native";

export const signingOut = async (router) => {
    try {
        await signOut(auth);

        if (Platform.OS === "web") {
            localStorage.clear();
        } else {
            await AsyncStorage.clear();
        }

        if (router) {
            router.replace("/");

        } else {
            console.warn("Router is not defined. Unable to redirect after sign-out.");
        }
    } catch (error) {
        console.error("Sign out error:", error);
        alert("Fejl, " + "Kunne ikke logge ud. Prøv venligst igen.");
    }
};
