"use client";

import Link from "next/link";

interface Props {
  version: string;
  financialYear: string;
}

export default function ProfileDashboardTopBar({ version, financialYear }: Props) {
  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-white border-b border-[var(--border-default)]">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <span className="text-[15px] font-bold text-slate-900">
          Vestro<span className="text-slate-500">fin</span>
          <span className="text-gray-400 font-medium"> — Your Financial DNA</span>
        </span>
      </Link>
      <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full shrink-0">
        {version} &middot; FY {financialYear}
      </span>
    </header>
  );
}
