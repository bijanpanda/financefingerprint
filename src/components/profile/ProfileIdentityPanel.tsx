"use client";

import { useState } from "react";
import { IdentityProfile, FinancialProfile } from "@/types/profile";
import { Currency } from "@/types";
import { toJsDate } from "@/lib/profileGuard";
import { formatCurrency, getCurrencySymbol } from "@/utils/currency";

interface Props {
  identity: IdentityProfile;
  financial: Pick<FinancialProfile, "monthlyGrossIncome" | "incomeStability" | "hasSecondaryIncome">;
  memberSince: Date | unknown;
  personaColor: string;
  currency: Currency;
  onReassessClick: () => void;
}

function getIncomeRangeLabel(income: number, currency: Currency): string {
  if (income <= 0) return formatCurrency(0, currency);
  const magnitude = Math.pow(10, Math.floor(Math.log10(income)));
  const step = magnitude / 2;
  const lower = Math.floor(income / step) * step;
  const upper = lower + step;
  return `${formatCurrency(lower, currency)} – ${formatCurrency(upper, currency)}`;
}

const RESIDENCE_LABELS: Record<string, string> = {
  urban: "Urban",
  semi_urban: "Semi-Urban",
  rural: "Rural",
};

const EDUCATION_LABELS: Record<string, string> = {
  below_10th: "Below 10th",
  hsc: "Higher Secondary",
  graduate: "Graduate",
  postgraduate: "Post Graduate",
  professional: "Professional",
};

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function ProfileIdentityPanel({ identity, financial, memberSince, personaColor, currency, onReassessClick }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const memberSinceDate = toJsDate(memberSince);

  return (
    <div className="h-full flex flex-col">
      {/* Avatar + name */}
      <div className="text-center px-8 pt-10 pb-8 border-b border-[var(--border-default)]">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-sm"
          style={{ backgroundColor: personaColor }}
        >
          {getInitials(identity.fullName)}
        </div>
        <p className="text-xl font-bold text-slate-800 truncate">{identity.fullName}</p>
        <p className="text-sm text-gray-400 mt-1">
          Member since {memberSinceDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
        {/* Personal */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Personal</p>
            <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full uppercase">Read-only</span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-base">
            <div className="flex items-center gap-2.5 text-slate-700">
              <span className="text-xl">🗓</span> <span>{identity.age} years</span>
            </div>
            {identity.gender && (
              <div className="flex items-center gap-2.5 text-slate-700 capitalize">
                <span className="text-xl">👤</span> <span>{identity.gender.replace(/_/g, " ")}</span>
              </div>
            )}
            <div className="col-span-2 flex items-center gap-2.5 text-slate-700">
              <span className="text-xl">📍</span> <span>{identity.city} &middot; {RESIDENCE_LABELS[identity.residenceType]}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2.5 text-slate-700">
              <span className="text-xl">🎓</span> <span>{EDUCATION_LABELS[identity.educationLevel]}</span>
            </div>
          </dl>
        </section>

        {/* Household */}
        <section>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Household</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-base">
            <div className="flex items-center gap-2.5 text-slate-700 capitalize">
              <span className="text-xl">💛</span> <span>{identity.familyStatus}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <span className="text-xl">👥</span> <span>{identity.dependents} dependent{identity.dependents === 1 ? "" : "s"}</span>
            </div>
          </dl>
        </section>

        {/* Employment */}
        <section>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Employment</p>
          <div className="flex items-center gap-2.5 text-base text-slate-700 capitalize">
            <span className="text-xl">💼</span> <span>{identity.employmentType.replace(/_/g, " ")} &middot; {identity.employmentSubType}</span>
          </div>
        </section>

        {/* Income */}
        <section>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Income</p>
          <dl className="space-y-3 text-base">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{getCurrencySymbol(currency)}</span>
              <span className="font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
                {getIncomeRangeLabel(financial.monthlyGrossIncome, currency)}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 capitalize">
              <span className="text-xl">📈</span> <span>{financial.incomeStability}</span>
            </div>
            {financial.hasSecondaryIncome && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <span className="text-xl">➕</span> <span>Secondary income</span>
              </div>
            )}
          </dl>
        </section>
      </div>

      {/* Re-assess button */}
      <div className="p-6 border-t border-[var(--border-default)]">
        <button
          onClick={() => setConfirmOpen(true)}
          className="w-full text-sm font-semibold text-slate-500 border border-slate-200 rounded-lg py-3 hover:bg-slate-50 transition-colors"
        >
          Re-assess profile
        </button>
      </div>

      {/* Confirm modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="glass-card bg-white rounded-2xl p-6 max-w-sm w-full">
            <h4 className="text-base font-bold text-slate-800 mb-2">Re-assess your Financial DNA?</h4>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              This starts the full profiling flow again. Your current profile stays intact until you finish — reserve this for a major life event or an annual check-in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 text-sm font-medium text-slate-500 border border-slate-200 rounded-lg py-2 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onReassessClick}
                className="flex-1 gradient-btn text-white text-sm font-semibold rounded-lg py-2"
              >
                Re-assess
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
