import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export const signingOut = async (router) => {
  try {
    await signOut(auth);
    router.replace("/");
  } catch (error) {
    console.error("Sign out error", error);
  }
};
