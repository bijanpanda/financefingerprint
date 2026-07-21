"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}***@${domain}`;
}

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [cooldown, setCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    setResendMessage("");
    setResendError("");
    const user = auth.currentUser;
    if (!user) {
      setResendError("Session expired. Please sign up again.");
      return;
    }
    try {
      const firstName = (user.displayName || user.email || "").split(/[ @]/)[0];
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, email: user.email, firstName }),
      });
      if (!res.ok) throw new Error("Failed");
      setResendMessage("Sent! Check your inbox.");
      setCooldown(60);
    } catch {
      setResendError("Failed to resend. Please try again in a moment.");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 hero-gradient-bg">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900">Vestro<span className="text-slate-500">fin</span></span>
        </div>

        {/* Email icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">Check your inbox</h1>

        <p className="text-gray-600 mb-1">We sent an activation link to</p>
        <p className="font-semibold text-slate-800 mb-4">
          {email ? maskEmail(email) : "your email"}
        </p>
        <p className="text-gray-600 mb-6">
          Click the link in that email to activate your account.
        </p>

        {resendMessage && (
          <div className="bg-teal-50 text-teal-700 p-3 rounded-xl mb-4 text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {resendMessage}
          </div>
        )}

        {resendError && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-4 text-sm">
            {resendError}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-1">
          {"Didn't receive it? "}
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={handleResend}
              className="text-teal-600 font-medium hover:underline"
            >
              Resend email
            </button>
          )}
        </p>

        <p className="text-xs text-gray-400 mb-6">The link expires in 24 hours.</p>

        <p className="text-xs text-gray-400 mb-4">
          Check your spam or junk folder if you don&apos;t see it.
        </p>

        <div className="border-t border-gray-100 pt-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-teal-600">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
