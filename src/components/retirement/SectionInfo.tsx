"use client";

import { useState } from "react";

interface Props {
  description: string;
}

// A small (i) button next to a section header that toggles a one-line
// explanation of what the section is for — click, not hover, so it works
// on touch too.
export default function SectionInfo({ description }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="What is this section?"
        aria-expanded={open}
        className="w-4 h-4 rounded-full border border-slate-300 text-[10px] leading-none text-slate-400 flex items-center justify-center hover:border-teal-400 hover:text-teal-600 shrink-0"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-6 z-10 w-56 rounded-lg bg-slate-800 text-white text-xs font-normal normal-case tracking-normal leading-snug p-2.5 shadow-lg"
        >
          {description}
        </span>
      )}
    </span>
  );
}
