import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Currency } from "@/types";

const googleProvider = new GoogleAuthProvider();

export async function signUp(email: string, password: string, displayName: string, currency: Currency) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    displayName,
    currency,
    createdAt: Timestamp.now(),
  });
  return cred.user;
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle(currency: Currency) {
  const cred = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, "users", cred.user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", cred.user.uid), {
      email: cred.user.email,
      displayName: cred.user.displayName || "",
      currency,
      createdAt: Timestamp.now(),
    });
  }
  return cred.user;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
