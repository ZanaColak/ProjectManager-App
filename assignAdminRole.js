const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({credential: admin.credential.cert(serviceAccount)});

const database = admin.firestore();

const assignAdminRole = async (uid) => {
    try {
        const userRef = database.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            await userRef.set({role: "admin"});
        } else {
            await userRef.update({role: "admin"});
        }
    } catch (error) {
        console.error("Error updating role:", error);
    }
};

assignAdminRole("P5sLltcuudRgqaqR3XcGlTqWsWr1");
