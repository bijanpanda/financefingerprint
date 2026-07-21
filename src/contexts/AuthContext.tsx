"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getUserCurrency, saveUserCurrency } from "@/lib/firebase/userRegion";
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
    // If redirected from signup with ?currency=XXX, save it immediately
    const params = new URLSearchParams(window.location.search);
    const urlCurrency = params.get("currency") as Currency | null;
    if (urlCurrency) {
      saveUserCurrency(urlCurrency);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const cachedCurrency = (urlCurrency || getUserCurrency()) as Currency | null;
          if (cachedCurrency) {
            setState({ user, currency: cachedCurrency, loading: false });
            return;
          }

          const snap = await getDoc(doc(db, "users", user.uid));

          const currency = snap.exists() ? (snap.data().currency as Currency) : "USD";
          setState({ user, currency, loading: false });
        } catch {
          setState({ user, currency: "USD", loading: false });
        }
      } else {
        setState({ user: null, currency: "USD", loading: false });
      }
    });
    return unsubscribe;
  }, []);

  // When currency is saved (e.g. after Google sign-in completes),
  // update context immediately without waiting for onAuthStateChanged to re-fire
  useEffect(() => {
    function handleCurrencyChanged(e: Event) {
      const currency = (e as CustomEvent<string>).detail as Currency;
      setState((prev) => prev.user ? { ...prev, currency } : prev);
    }
    window.addEventListener("ff_currency_changed", handleCurrencyChanged);
    return () => window.removeEventListener("ff_currency_changed", handleCurrencyChanged);
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
