"use client";

import { useState } from "react";

interface Props {
  text: string;
}

// Splits on sentence boundaries, shows the first 3, with a "Read more" expand toggle.
export default function AINarrativeBlock({ text }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sentences = text.replace(/\n+/g, " ").match(/[^.!?]+[.!?]+/g) || [text];
  const preview = sentences.slice(0, 3).join(" ").trim();
  const hasMore = sentences.length > 3;

  return (
    <div>
      <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
        {expanded ? text : preview}
      </p>
      {hasMore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-sm font-semibold text-teal-600 hover:text-teal-700 mt-2.5"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
