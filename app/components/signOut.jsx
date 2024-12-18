import {signOut} from "firebase/auth";
import {auth} from "../config/firebase";

export const signingOut = async (router) => {
    try {
        await signOut(auth);
        if (router) {
            router.push("/");
        } else {
            console.warn("Router is not defined. Unable to redirect after sign-out.");
        }
    } catch (error) {
        console.error("Sign out error:", error);
        alert("Failed to sign out. Please try again.");
    }
};
