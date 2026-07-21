import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Currency } from "@/types";
import { saveUserRegion, saveUserCurrency, clearUserRegion } from "./firebase/userRegion";
import type { Region } from "./firebase/firebaseRegion";

const googleProvider = new GoogleAuthProvider();

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  currency: Currency,
  region: Region = "US"
) {
  // Save BEFORE account creation so onAuthStateChanged reads correct values instantly
  saveUserRegion(region);
  saveUserCurrency(currency);

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  // Write user doc client-side using default app (authenticated)
  await setDoc(doc(db, "users", cred.user.uid), {
    displayName,
    currency,
    region,
    createdAt: Timestamp.now(),
  });

  // Send branded verification email via our API
  const firstName = displayName.split(" ")[0] || displayName;
  await fetch("/api/auth/send-verification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid: cred.user.uid, email, firstName }),
  });

  return cred.user;
}

export async function signIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  if (!cred.user.emailVerified) {
    // Resend our branded verification email then sign out — user must verify first
    const firstName = (cred.user.displayName || email).split(/[ @]/)[0];
    fetch("/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: cred.user.uid, email, firstName }),
    }).catch(() => {});
    await firebaseSignOut(auth);
    const err = new Error("Email not verified") as Error & { code: string };
    err.code = "auth/email-not-verified";
    throw err;
  }

  // Read currency from default Firestore
  try {
    const snap = await import("firebase/firestore").then(({ doc, getDoc }) =>
      getDoc(doc(db, "users", cred.user.uid))
    );
    if (snap.exists()) {
      const data = snap.data();
      if (data.region) saveUserRegion(data.region as Region);
      if (data.currency) saveUserCurrency(data.currency);
    }
  } catch {
    // Keep defaults
  }
  return cred.user;
}

export async function signInWithGoogle(currency: Currency, region: Region = "US") {
  // For NEW users: save selected currency before popup so onAuthStateChanged reads it instantly
  // For RETURNING users: this will be overwritten after popup with their stored currency
  saveUserRegion(region);
  saveUserCurrency(currency);

  const cred = await signInWithPopup(auth, googleProvider);
  const additionalInfo = getAdditionalUserInfo(cred);

  if (additionalInfo?.isNewUser) {
    // New user — write Firestore doc client-side using default app (authenticated)
    await setDoc(doc(db, "users", cred.user.uid), {
      displayName: cred.user.displayName || "",
      currency,
      region,
      createdAt: Timestamp.now(),
    });

    // Send welcome email via server-side API
    const firstName = (cred.user.displayName || "").split(" ")[0] || "there";
    fetch("/api/user/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cred.user.email, firstName, currency }),
    }).catch(() => {});
  }

  return cred.user;
}

export async function signOut() {
  clearUserRegion();
  return firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}
