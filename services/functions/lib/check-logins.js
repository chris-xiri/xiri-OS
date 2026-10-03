"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// Initialize app if not already initialized
try {
    (0, app_1.initializeApp)({ projectId: "xiri-os" });
}
catch (e) { }
const db = (0, firestore_1.getFirestore)();
async function run() {
    const usersSnap = await db.collection("users").get();
    console.log("User Login Activity:");
    console.log("--------------------------------------------------");
    for (const doc of usersSnap.docs) {
        const data = doc.data();
        if (data.email === "chris@xiri.ai")
            continue;
        let lastLogin = "N/A";
        let created = "N/A";
        if (data.lastLoginAt)
            lastLogin = data.lastLoginAt.toDate ? data.lastLoginAt.toDate().toISOString() : data.lastLoginAt;
        if (data.createdAt)
            created = data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
        console.log(`Email: ${data.email || 'Unknown'}`);
        console.log(`Created: ${created}`);
        console.log(`Last Login: ${lastLogin}`);
        console.log("---");
    }
}
run().catch(console.error);
//# sourceMappingURL=check-logins.js.map