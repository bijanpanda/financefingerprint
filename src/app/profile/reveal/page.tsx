"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getLatestProfile } from "@/lib/profileDb";
import { PERSONA_DEFINITIONS } from "@/utils/questionBank";
import { SPENDING_ARCHETYPE_DEFINITIONS } from "@/utils/spendingQuestionBank";
import PersonaRevealCard from "@/components/profile/PersonaRevealCard";
import SpendingRevealCard from "@/components/profile/SpendingRevealCard";
import AllocationChart from "@/components/profile/AllocationChart";
import ProfileFlags from "@/components/profile/ProfileFlags";
import FinancialHealthMeter from "@/components/profile/FinancialHealthMeter";
import { CustomerProfile } from "@/types/profile";
import DnaBackground from "@/components/profile/DnaBackground";

export default function ProfileRevealPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getLatestProfile(user.uid).then((p) => {
        setProfile(p);
        setLoading(false);
      });
    }
  }, [user]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">No profile found. Please complete the profiling flow first.</p>
        <Link href="/profile/setup" className="gradient-btn text-white px-6 py-2 rounded-xl text-sm">
          Start Profiling
        </Link>
      </div>
    );
  }

  const def = PERSONA_DEFINITIONS[profile.persona.personaType];
  const spending = profile.financial.spendingPersona;
  const spendingDef = spending ? SPENDING_ARCHETYPE_DEFINITIONS[spending.archetype] : null;
  const allFlags = [...profile.aiSynthesis.flags, ...(profile.aiSynthesis.spendingFlags || [])];

  return (
    <div className="min-h-screen hero-gradient-bg relative">
      <DnaBackground />
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-800">
              Vestro<span className="text-slate-500">fin</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-teal-600 font-medium">Your Financial DNA</span>
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Locked Profile Banner */}
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border border-teal-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Financial DNA — FY {profile.financialYear}
                </p>
                <p className="text-xs text-gray-500">
                  Profile locked for this financial year &bull; Version {profile.profileVersion}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-3 py-1.5 rounded-full">
              Read Only
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed border-t border-teal-100 pt-3">
            This profile is valid until March {parseInt(profile.financialYear.split("-")[0]) + 1}. It can only be revised for major life events
            such as Retirement, Marriage, Birth of a Child, or a significant change in income.
            To request a reassessment, please contact support or use the Life Event option in settings.
          </p>
        </div>

        {/* Persona Card */}
        <PersonaRevealCard persona={profile.persona} definition={def} />

        {/* Spending Card */}
        {spending && spendingDef && <SpendingRevealCard spending={spending} definition={spendingDef} />}

        {/* Combined Persona Tag */}
        {profile.aiSynthesis.combinedPersonaTag && spendingDef && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 text-2xl mb-2">
              <span>{def.emoji}</span>
              <span className="text-slate-300">|</span>
              <span>{spendingDef.emoji}</span>
            </div>
            <p className="text-lg font-bold gradient-text">{profile.aiSynthesis.combinedPersonaTag}</p>
            {profile.aiSynthesis.spendingNarrative && (
              <p className="text-sm text-gray-600 mt-3 max-w-xl mx-auto leading-relaxed">
                {profile.aiSynthesis.spendingNarrative}
              </p>
            )}
          </div>
        )}

        {/* Health Meter + Narrative */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <FinancialHealthMeter score={profile.aiSynthesis.financialHealthScore} />
          </div>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Your Financial DNA Summary
            </h3>
            {profile.aiSynthesis.narrativeSummary.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Allocation Chart */}
        <div className="glass-card rounded-2xl p-8">
          <AllocationChart allocation={profile.aiSynthesis.suggestedAllocation} />
        </div>

        {/* Flags */}
        {allFlags.length > 0 && (
          <div className="glass-card rounded-2xl p-8">
            <ProfileFlags flags={allFlags} />
          </div>
        )}

        {/* Peer Comparison */}
        {profile.aiSynthesis.peerComparison && (
          <div className="glass-card rounded-2xl p-6 text-center">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Peer Comparison</span>
            <p className="text-sm text-gray-700 mt-1">{profile.aiSynthesis.peerComparison}</p>
          </div>
        )}

        {/* Recommendations */}
        {profile.aiSynthesis.moduleRecommendations && (
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
              Personalised Recommendations
            </h3>
            <div className="space-y-3">
              {Object.entries(profile.aiSynthesis.moduleRecommendations)
                .filter(([, v]) => v)
                .map(([key, value]) => (
                  <div key={key} className="bg-white/60 rounded-xl p-4">
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                      {key}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{value}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pb-10">
          <Link
            href="/profile/dashboard"
            className="gradient-btn text-white px-10 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all inline-block"
          >
            Enter my Vestrofin Dashboard &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
