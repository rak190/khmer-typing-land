import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseRealtimeReady =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.databaseURL) &&
  firebaseConfig.databaseURL !== "PASTE_YOUR_DATABASE_URL_HERE";

let app: FirebaseApp | null = null;
let database: Database | null = null;

if (isFirebaseRealtimeReady) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    database = getDatabase(app);
  } catch (error) {
    console.warn("Firebase is not ready. Room matches are disabled until the config is fixed.", error);
  }
}

export const realtimeDb = database;
