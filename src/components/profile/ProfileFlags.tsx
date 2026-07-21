"use client";

import { ProfileFlag } from "@/types/profile";

interface Props {
  flags: ProfileFlag[];
}

export const FLAG_STYLES = {
  critical: { bg: "bg-rose-50", border: "border-rose-200", icon: "text-rose-500", text: "text-rose-800" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-500", text: "text-amber-800" },
  info: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-500", text: "text-blue-800" },
};

export const FLAG_ICONS = {
  critical: "⚠️",
  warning: "⚡",
  info: "💡",
};

export default function ProfileFlags({ flags }: Props) {
  if (flags.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
        Key Insights
      </h3>
      {flags.map((flag, i) => {
        const style = FLAG_STYLES[flag.type];
        return (
          <div
            key={i}
            className={`${style.bg} border ${style.border} rounded-xl p-4 flex items-start gap-3`}
          >
            <span className="text-lg">{FLAG_ICONS[flag.type]}</span>
            <div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${style.icon}`}>
                {flag.category.replace(/_/g, " ")}
              </span>
              <p className={`text-sm mt-0.5 ${style.text}`}>{flag.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
