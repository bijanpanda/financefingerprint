import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

export type Region = "IN" | "US";

const configIN = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_IN_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_IN_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_IN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_IN_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_IN_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_IN_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const configUS = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_US_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_US_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_US_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_US_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_US_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_US_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp(region: Region): FirebaseApp {
  const name = region === "IN" ? "ff-india" : "ff-us";
  const config = region === "IN" ? configIN : configUS;
  const existing = getApps().find((a) => a.name === name);
  return existing || initializeApp(config, name);
}

export function getDb(region: Region): Firestore {
  return getFirestore(getFirebaseApp(region));
}

export function getFirebaseAuth(region: Region): Auth {
  return getAuth(getFirebaseApp(region));
}
