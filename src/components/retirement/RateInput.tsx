"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number | null; // a fraction, e.g. 0.08 for 8%
  onChange: (fraction: number | null) => void;
  placeholder?: string;
  className?: string;
}

function format(value: number | null): string {
  return value == null ? "" : (value * 100).toFixed(2);
}

// A free-text percentage input. A plain controlled type="number" bound to
// `(value * 100).toFixed(2)` re-formats itself on every keystroke — typing
// "7.5" collapses back to "7.50" after each digit, fighting the cursor.
// This tracks its own display text while focused and only re-syncs from
// the committed value on blur (or when it changes from outside, e.g. a
// solve-for tile applying a new value).
export default function RateInput({ value, onChange, placeholder, className }: Props) {
  const [text, setText] = useState(() => format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(format(value));
  }, [value, focused]);

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      value={text}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw.trim() === "") {
          onChange(null);
          return;
        }
        const parsed = Number(raw);
        if (!Number.isNaN(parsed)) onChange(parsed / 100);
      }}
      onBlur={() => {
        setFocused(false);
        setText(format(value));
      }}
    />
  );
}
