import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export const signingOut = async (router) => {
  try {
    await signOut(auth);
    router.replace("/index");
  } catch (error) {
    console.error("Sign out error", error);
  }
};
