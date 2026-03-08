import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyDiaDF0lR6ZA2ZObWSXUQKPcapjJFreJOk",
    authDomain: "xiri-os.firebaseapp.com",
    projectId: "xiri-os",
    storageBucket: "xiri-os.firebasestorage.app",
    messagingSenderId: "999029412758",
    appId: "1:999029412758:web:4c79c22aee9e971f3d43b7",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export default app;

