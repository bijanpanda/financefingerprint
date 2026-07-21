"use client";

import { ReactNode } from "react";

interface Props {
  icon: string;
  title: string;
  completionBadge?: string;
  children: ReactNode;
}

export default function ProfileLayerCard({ icon, title, completionBadge, children }: Props) {
  return (
    <div className="glass-card rounded-2xl p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        {completionBadge && (
          <span className="text-xs font-semibold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full uppercase tracking-wider">
            {completionBadge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
