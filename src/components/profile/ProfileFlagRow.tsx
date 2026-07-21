"use client";

import { ProfileFlag } from "@/types/profile";
import { FLAG_STYLES, FLAG_ICONS } from "./ProfileFlags";

interface Props {
  flag: ProfileFlag;
}

// Single flag row — compact variant used in the dashboard's right column,
// styled consistently with the ProfileFlags list on the reveal page.
export default function ProfileFlagRow({ flag }: Props) {
  const style = FLAG_STYLES[flag.type];
  return (
    <div className={`${style.bg} border ${style.border} rounded-lg px-4 py-3 flex items-start gap-3`}>
      <span className="text-lg shrink-0">{FLAG_ICONS[flag.type]}</span>
      <p className={`text-sm leading-relaxed ${style.text}`}>{flag.message}</p>
    </div>
  );
}
