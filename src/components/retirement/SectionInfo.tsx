"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface Props {
  description: string;
}

const TOOLTIP_WIDTH = 224;
const VIEWPORT_MARGIN = 8;

// A small (i) button next to a section header that toggles a one-line
// explanation of what the section is for — click, not hover, so it works
// on touch too. Rendered through a portal into document.body: the section
// cards use overflow-hidden to clip their rounded corners, which was
// silently clipping the tooltip whenever it extended past the card edge.
export default function SectionInfo({ description }: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, rect.left),
        window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN
      );
      setCoords({ top: rect.bottom + 6, left });
    }
    place();

    function handleOutside(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    window.addEventListener("mousedown", handleOutside);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      window.removeEventListener("mousedown", handleOutside);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
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
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: TOOLTIP_WIDTH,
              color: "white",
              WebkitTextFillColor: "white",
              background: "#1e293b",
            }}
            className="z-50 rounded-lg text-xs font-normal normal-case tracking-normal leading-snug p-2.5 shadow-lg"
          >
            {description}
          </div>,
          document.body
        )}
    </>
  );
}
