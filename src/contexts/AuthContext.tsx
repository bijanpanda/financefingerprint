"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Currency } from "@/types";

interface AuthState {
  user: User | null;
  currency: Currency;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  currency: "USD",
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    currency: "USD",
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const currency = snap.exists() ? (snap.data().currency as Currency) : "USD";
        setState({ user, currency, loading: false });
      } else {
        setState({ user: null, currency: "USD", loading: false });
      }
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
