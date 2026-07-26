"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { signIn } from "@/lib/auth";
import { FamilyRole } from "@/types/family";

const ROLE_LABEL: Record<FamilyRole, string> = {
  principal: "Principal (full access)",
  child: "Child (simplified budget)",
};

type ViewState = "loading" | "invalid" | "used" | "ready" | "declined" | "accepted";

interface InviteDetails {
  inviterName: string;
  inviteeEmail: string;
  role: FamilyRole;
  isExistingAccount: boolean;
}

export default function FamilyInviteLandingPage() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();

  const [state, setState] = useState<ViewState>("loading");
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    fetch(`/api/family/invite/${token}`)
      .then(async (r) => {
        if (r.status === 404) return setState("invalid");
        if (r.status === 410) return setState("used");
        const data = await r.json();
        setInvite(data);
        setState("ready");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  async function handleAcceptExisting() {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/family/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invite");
      setState("accepted");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDecline() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/family/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to decline invite");
      setState("declined");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignupAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!invite) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/family/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, displayName: signupName, password: signupPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create your account");

      await signIn(invite.inviteeEmail, signupPassword);
      setState("accepted");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 hero-gradient-bg">
      <div className="w-full max-w-md glass-card rounded-2xl p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
            <span className="text-white text-sm">💰</span>
          </div>
          <span className="text-xl font-bold text-slate-900">
            Vestro<span className="text-slate-500">fin</span>
          </span>
        </div>

        {state === "loading" && (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
          </div>
        )}

        {state === "invalid" && (
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              This invite link isn&apos;t valid. Ask whoever invited you to send a fresh one.
            </p>
            <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">
              Go to Budget Planning
            </Link>
          </div>
        )}

        {state === "used" && (
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              This invite has already been used. If you think that&apos;s a mistake, ask whoever
              invited you to send a new one.
            </p>
            <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">
              Go to Budget Planning
            </Link>
          </div>
        )}

        {state === "declined" && (
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-4">
              You&apos;ve declined this invite. Nothing about your account has changed.
            </p>
            <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">
              Go to Budget Planning
            </Link>
          </div>
        )}

        {state === "accepted" && (
          <div className="text-center space-y-3">
            <p className="text-gray-700 text-sm">You&apos;ve joined the family group! 🎉</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/family" className="gradient-btn text-white px-6 py-2 rounded-xl text-sm font-medium inline-block">
                Go to Family Budget
              </Link>
              <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">
                Go to Budget Planning
              </Link>
            </div>
          </div>
        )}

        {state === "ready" && invite && (
          <>
            <h1 className="text-xl font-bold text-center text-slate-900 mb-2">
              You&apos;ve been invited to a Family Budget
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              <strong>{invite.inviterName}</strong> invited you to join as a{" "}
              <strong>{ROLE_LABEL[invite.role]}</strong>.
            </p>

            {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            {invite.isExistingAccount ? (
              authLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-4 border-slate-800 border-t-transparent rounded-full" />
                </div>
              ) : !user || user.email?.toLowerCase() !== invite.inviteeEmail.toLowerCase() ? (
                <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-sm text-center">
                  Please{" "}
                  <Link href="/login" className="font-medium underline">
                    sign in
                  </Link>{" "}
                  with <strong>{invite.inviteeEmail}</strong>, then come back to this link to accept.
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleDecline}
                    disabled={busy}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-slate-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={handleAcceptExisting}
                    disabled={busy}
                    className="flex-1 py-2.5 gradient-btn text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    {busy ? "Joining..." : "Accept"}
                  </button>
                </div>
              )
            ) : (
              <>
                <form onSubmit={handleSignupAccept} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      disabled
                      value={invite.inviteeEmail}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Create a password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-2.5 gradient-btn text-white rounded-xl font-medium disabled:opacity-50"
                  >
                    {busy ? "Joining..." : "Create account & join"}
                  </button>
                </form>
                <button
                  onClick={handleDecline}
                  disabled={busy}
                  className="w-full mt-3 text-sm text-gray-500 hover:underline text-center"
                >
                  No thanks, decline this invite
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
