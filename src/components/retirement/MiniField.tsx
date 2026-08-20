"use client";

import { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
}

// A persistent label for compact row inputs — unlike a placeholder, it
// doesn't disappear once the field has a value, so a row of small numeric
// inputs stays legible after you've filled it in.
export default function MiniField({ label, children }: Props) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">{label}</span>
      {children}
    </label>
  );
}
