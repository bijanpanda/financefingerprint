"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { FamilyRole } from "@/types/family";

interface FamilyMemberRow {
  uid: string;
  role: FamilyRole;
  inviteStatus: "pending" | "confirmed" | "declined";
  email: string;
  displayName: string;
  joinedAt: string | null;
}

interface PendingInviteRow {
  inviteeEmail: string;
  role: FamilyRole;
  createdAt: string;
  lastReminderSentAt: string | null;
}

type Status =
  | { inGroup: false }
  | { inGroup: true; role: "child"; isInitiator: false; groupId: string; initiatorName: string; orphaned: boolean }
  | {
      inGroup: true;
      role: "principal";
      isInitiator: boolean;
      groupId: string;
      currency: string;
      initiatorName: string;
      members: FamilyMemberRow[];
      pendingInvites: PendingInviteRow[];
    };

const ROLE_LABEL: Record<FamilyRole, string> = { principal: "Principal", child: "Child" };

export default function FamilyHubPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<FamilyRole>("principal");
  const [inviting, setInviting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [removingUid, setRemovingUid] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [confirmingOrphan, setConfirmingOrphan] = useState(false);
  const [showGraduateModal, setShowGraduateModal] = useState(false);
  const [graduateAck, setGraduateAck] = useState(false);
  const [graduating, setGraduating] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`/api/family/status?uid=${user.uid}`);
    const data = await res.json();
    setStatus(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) refresh();
  }, [user, authLoading, router, refresh]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setInviting(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/family/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviterUid: user.uid, inviteeEmail: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invite");
      setNotice(`Invite sent to ${inviteEmail.trim()}.`);
      setInviteEmail("");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setInviting(false);
    }
  }

  async function handleResend(email: string) {
    if (!user || !status?.inGroup || status.role !== "principal") return;
    setResendingEmail(email);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/family/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyGroupId: status.groupId, inviteeEmail: email, requesterUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend invite");
      setNotice(`Reminder resent to ${email}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResendingEmail(null);
    }
  }

  async function handleRemove(targetUid: string, targetName: string) {
    if (!user || !status?.inGroup || status.role !== "principal") return;
    if (!window.confirm(`Remove ${targetName} from your family?`)) return;
    setRemovingUid(targetUid);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/family/remove-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterUid: user.uid, targetUid, groupId: status.groupId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member");
      setNotice(`${targetName} was removed from your family.`);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRemovingUid(null);
    }
  }

  async function handleLeave() {
    if (!user) return;
    if (!window.confirm("Leave this family group? You'll keep your own budget data, but you'll no longer be part of this family.")) return;
    setLeaving(true);
    setError("");
    try {
      const res = await fetch("/api/family/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to leave family");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLeaving(false);
    }
  }

  async function handleOrphanConfirm() {
    if (!user) return;
    setConfirmingOrphan(true);
    setError("");
    try {
      const res = await fetch("/api/family/orphan-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm");
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setConfirmingOrphan(false);
    }
  }

  async function handleGraduate() {
    if (!user) return;
    setGraduating(true);
    setError("");
    try {
      const res = await fetch("/api/family/graduate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterUid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to graduate");
      setShowGraduateModal(false);
      setGraduateAck(false);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGraduating(false);
    }
  }

  if (authLoading || loading || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-gradient-bg">
        <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  const inviteForm = (
    <form onSubmit={handleInvite} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Family member&apos;s email</label>
        <input
          type="email"
          required
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as FamilyRole)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="principal">Principal (full access)</option>
          <option value="child">Child (simplified budget)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={inviting}
        className="w-full py-2.5 gradient-btn text-white rounded-xl font-medium disabled:opacity-50"
      >
        {inviting ? "Sending..." : "Send Invite"}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen hero-gradient-bg px-4 py-10">
      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8">
        <Link href="/dashboard" className="text-sm text-teal-600 hover:underline">&larr; Back to Budget Planning</Link>
        <h1 className="text-2xl font-bold text-slate-900 mb-1 mt-2">Family Budget</h1>
        <p className="text-sm text-gray-500 mb-6">Invite family members to share budgeting together.</p>

        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {notice && <div className="bg-teal-50 text-teal-700 p-3 rounded-xl mb-4 text-sm">{notice}</div>}

        {!status.inGroup && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              You&apos;re not part of a family group yet. Invite someone to get started — this makes you the
              organizer of your new family group.
            </p>
            {inviteForm}
          </>
        )}

        {status.inGroup && status.role === "child" && status.orphaned && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
              <strong>{status.initiatorName}</strong> is no longer part of Vestrofin&apos;s Family Budget, and
              there&apos;s no other adult left in it. Your budget data is safe and unchanged — confirm below to
              continue as an independent account.
            </div>
            <button
              onClick={handleOrphanConfirm}
              disabled={confirmingOrphan}
              className="w-full py-2.5 gradient-btn text-white rounded-xl font-medium disabled:opacity-50"
            >
              {confirmingOrphan ? "Confirming..." : "Confirm & Continue Independently"}
            </button>
          </div>
        )}

        {status.inGroup && status.role === "child" && !status.orphaned && (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              You&apos;re part of <strong>{status.initiatorName}</strong>&apos;s family on Vestrofin.
            </p>
            <button
              onClick={() => setShowGraduateModal(true)}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Graduate — become an independent account
            </button>
          </div>
        )}

        {status.inGroup && status.role === "principal" && (
          <div className="space-y-8">
            <Link
              href="/family/budget"
              className="block w-full text-center py-2.5 border border-teal-200 text-teal-700 rounded-xl font-medium hover:bg-teal-50 transition-colors"
            >
              View Family Budget
            </Link>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Members</h2>
              <div className="space-y-2">
                {status.members.map((m) => (
                  <div key={m.uid} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {m.displayName} {m.uid === user?.uid && <span className="text-gray-400">(you)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-3 py-1 rounded-full">
                        {ROLE_LABEL[m.role]}
                      </span>
                      {status.isInitiator && m.uid !== user?.uid && (
                        <button
                          onClick={() => handleRemove(m.uid, m.displayName)}
                          disabled={removingUid === m.uid}
                          className="text-xs font-semibold text-rose-500 hover:underline disabled:opacity-50"
                        >
                          {removingUid === m.uid ? "Removing..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {status.pendingInvites.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Pending Invites</h2>
                <div className="space-y-2">
                  {status.pendingInvites.map((inv) => (
                    <div key={inv.inviteeEmail} className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{inv.inviteeEmail}</p>
                        <p className="text-xs text-gray-500">Invited as {ROLE_LABEL[inv.role]}</p>
                      </div>
                      {status.isInitiator && (
                        <button
                          onClick={() => handleResend(inv.inviteeEmail)}
                          disabled={resendingEmail === inv.inviteeEmail}
                          className="text-xs font-semibold text-teal-600 hover:underline disabled:opacity-50"
                        >
                          {resendingEmail === inv.inviteeEmail ? "Resending..." : "Resend"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status.isInitiator ? (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Invite Someone</h2>
                {inviteForm}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                Only {status.initiatorName} can invite new members to this family.
              </p>
            )}

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="text-sm text-gray-400 hover:text-rose-500 underline disabled:opacity-50"
              >
                {leaving ? "Leaving..." : "Leave Family"}
              </button>
            </div>
          </div>
        )}
      </div>

      {showGraduateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Become an independent account</h2>
            <p className="text-sm text-slate-600 mb-4">
              This leaves your family group for good — it can&apos;t be undone. Your budget stays exactly as it
              is; it just won&apos;t be shared with this family anymore.
            </p>
            <label className="flex items-start gap-2 text-sm text-slate-700 mb-4">
              <input
                type="checkbox"
                checked={graduateAck}
                onChange={(e) => setGraduateAck(e.target.checked)}
                className="mt-0.5"
              />
              I understand this is permanent.
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowGraduateModal(false); setGraduateAck(false); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg font-medium text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGraduate}
                disabled={!graduateAck || graduating}
                className="flex-1 py-2 gradient-btn text-white rounded-lg font-medium disabled:opacity-50"
              >
                {graduating ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
