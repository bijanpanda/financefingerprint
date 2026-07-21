"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getProfileGuardContext } from "@/lib/profileGuard";
import { getProfileHistory } from "@/lib/profileDb";
import { PERSONA_DEFINITIONS } from "@/utils/questionBank";
import { CustomerProfile } from "@/types/profile";
import ProfileDashboardTopBar from "@/components/profile/ProfileDashboardTopBar";
import ProfileIdentityPanel from "@/components/profile/ProfileIdentityPanel";
import ProfileSummaryPanel from "@/components/profile/ProfileSummaryPanel";
import PersonaResultPanel from "@/components/profile/PersonaResultPanel";

type MobileTab = "me" | "profile" | "persona";

export default function ProfileDashboardPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [previousProfile, setPreviousProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [identityDrawerOpen, setIdentityDrawerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("profile");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { result, profile: current } = await getProfileGuardContext(user.uid);
      if (result === "redirect_to_profiling" || !current) {
        router.replace("/profile/setup");
        return;
      }
      setProfile(current);

      const history = await getProfileHistory(user.uid);
      const prior = history.find((p) => p.financialYear !== current.financialYear) || null;
      setPreviousProfile(prior);
      setLoading(false);
    })();
  }, [user, router]);

  if (authLoading || !user || loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-1)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  const personaColor = PERSONA_DEFINITIONS[profile.persona.personaType].color;

  const handleReassess = () => {
    // Hard navigation (not router.push): Next.js reuses the existing /profile/setup
    // client component instance for query-only navigations, so a lazily-read
    // window.location.search would go stale. A full reload guarantees a clean read.
    window.location.href = "/profile/setup?reassess=1";
  };

  const identityPanel = (
    <ProfileIdentityPanel
      identity={profile.identity}
      financial={profile.financial}
      memberSince={profile.createdAt}
      personaColor={personaColor}
      currency={currency}
      onReassessClick={handleReassess}
    />
  );

  const summaryPanel = <ProfileSummaryPanel profile={profile} previousProfile={previousProfile} currency={currency} />;

  const personaPanel = (
    <PersonaResultPanel
      investorPersona={profile.persona}
      spendingPersona={profile.financial.spendingPersona}
      aiSynthesis={profile.aiSynthesis}
    />
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--surface-1)]">
      <ProfileDashboardTopBar version={profile.profileVersion} financialYear={profile.financialYear} />

      {/* Desktop — full 3-column layout (lg and up), 25% / 50% / 25% split */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <aside className="w-1/4 shrink-0 border-r border-[var(--border-default)] bg-white overflow-hidden">
          {identityPanel}
        </aside>
        <main className="w-1/2 shrink-0 overflow-hidden">{summaryPanel}</main>
        <aside className="w-1/4 shrink-0 border-l border-[var(--border-default)] bg-white overflow-hidden">
          {personaPanel}
        </aside>
      </div>

      {/* Tablet — left column collapses to an icon strip with a drawer (md to lg) */}
      <div className="hidden md:flex lg:hidden flex-1 overflow-hidden relative">
        <button
          onClick={() => setIdentityDrawerOpen(true)}
          className="w-14 shrink-0 border-r border-[var(--border-default)] bg-white flex flex-col items-center pt-6 gap-2 hover:bg-slate-50 transition-colors"
          aria-label="Show identity panel"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: personaColor }}
          >
            {profile.identity.fullName.trim()[0]?.toUpperCase() || "?"}
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <main className="flex-1 min-w-0 overflow-hidden">{summaryPanel}</main>
        <aside className="w-[320px] shrink-0 border-l border-[var(--border-default)] bg-white overflow-hidden">
          {personaPanel}
        </aside>

        {identityDrawerOpen && (
          <div className="absolute inset-0 z-40 flex">
            <div className="w-[340px] bg-white shadow-2xl overflow-hidden">{identityPanel}</div>
            <div className="flex-1 bg-black/30" onClick={() => setIdentityDrawerOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile — bottom tabs, one column full-screen at a time (below md) */}
      <div className="flex md:hidden flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden bg-white">
          {mobileTab === "me" && identityPanel}
          {mobileTab === "profile" && summaryPanel}
          {mobileTab === "persona" && personaPanel}
        </div>
        <nav className="shrink-0 border-t border-[var(--border-default)] bg-white flex">
          {([
            { key: "me", label: "Me", icon: "👤" },
            { key: "profile", label: "Profile", icon: "📊" },
            { key: "persona", label: "Persona", icon: "🧭" },
          ] as { key: MobileTab; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                mobileTab === tab.key ? "text-slate-900" : "text-gray-400"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
