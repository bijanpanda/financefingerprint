"use client";

import { useState } from "react";
import { PlanVersion, RetirementPlanDoc } from "@/lib/retirementDb";
import { formatCurrency } from "@/utils/currency";
import SectionInfo from "./SectionInfo";

interface Props {
  versions: PlanVersion[];
  onRestore: (plan: RetirementPlanDoc) => void;
}

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function VersionHistory({ versions, onRestore }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  function restore(version: PlanVersion) {
    const { versionId: _versionId, savedAt: _savedAt, ...plan } = version;
    setRestoringId(version.versionId);
    onRestore(plan);
    setTimeout(() => setRestoringId(null), 1200);
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="profile-label mb-0 flex items-center gap-1.5">
          Version history · {versions.length}
          <SectionInfo description="The Save button at the top of the page writes a new baseline you can always come back to. Older versions are never overwritten — the newest is always at the top, and clicking Restore loads it back into the editor." />
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {versions.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">No saved versions yet — your edits so far are a draft.</p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li key={v.versionId} className="flex items-center justify-between gap-2 border border-slate-200 rounded-xl px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{formatSavedAt(v.savedAt)}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      Retire {v.retirementAge} · {formatCurrency(v.currentBalance, v.baseCurrency)} balance
                    </p>
                  </div>
                  <button
                    onClick={() => restore(v)}
                    className="text-xs font-medium text-teal-700 hover:underline shrink-0"
                  >
                    {restoringId === v.versionId ? "Restored ✓" : "Restore"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
