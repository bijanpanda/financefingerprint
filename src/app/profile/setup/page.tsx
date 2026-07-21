"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSession } from "@/hooks/useProfileSession";
import { getProfileGuardContext } from "@/lib/profileGuard";
import { CustomerProfile } from "@/types/profile";
import DnaBackground from "@/components/profile/DnaBackground";

export default function ProfileSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { session, startSession } = useProfileSession(user?.uid);
  const [existingProfile, setExistingProfile] = useState<CustomerProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  // Lazy initializer runs synchronously on first render — avoids a race where the
  // profile-completeness check below could fire (and redirect away) before this is read.
  const [isReassess] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("reassess") === "1"
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      getProfileGuardContext(user.uid).then(({ result, profile }) => {
        // A deliberate re-assessment (from the dashboard's "Re-assess profile" button)
        // must reach the actual form instead of bouncing straight back to the dashboard.
        if (result === "proceed" && !isReassess) {
          setExistingProfile(profile);
        }
        setCheckingProfile(false);
      });
    }
  }, [user, isReassess]);

  useEffect(() => {
    if (existingProfile) {
      router.replace("/profile/dashboard");
    }
  }, [existingProfile, router]);

  if (authLoading || !user || checkingProfile || existingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  const resumeStep = session?.currentStep;
  const hasInProgressSession = resumeStep && resumeStep !== "setup" && resumeStep !== "identity";

  const handleStart = () => {
    startSession();
    // The "spending" step has no route of its own — it's rendered inline by /profile/financial.
    const route = resumeStep === "spending" ? "financial" : resumeStep;
    const target = hasInProgressSession ? `/profile/${route}` : "/profile/identity";
    window.location.href = target;
  };

  return (
    <div className="min-h-screen hero-gradient-bg relative">
      <DnaBackground />
      {/* Nav */}
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
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Build Your Financial DNA
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            A personalised analysis of your financial profile, risk tolerance, and investment persona.
          </p>
        </div>

        {/* Important note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <span className="text-xl mt-0.5">📌</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Please Note</p>
            <p className="text-sm text-amber-700 leading-relaxed">
              Your Financial DNA profile is a <strong>once-a-year exercise</strong> aligned to each financial year (April – March).
              Once completed, it can only be revised if you experience a major life event such as
              <strong> Retirement, Marriage, Birth of a Child, Job Change, or a significant shift in income</strong>.
              In such cases, you can request a profile reassessment from your settings page.
            </p>
          </div>
        </div>

        {/* Steps overview */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-5">
            3 Quick Steps &bull; ~8 Minutes
          </h2>
          <div className="space-y-4">
            {[
              { num: "1", title: "Identity Profile", desc: "Tell us about yourself — age, employment, family status.", icon: "👤" },
              { num: "2", title: "Financial Picture", desc: "Your income, expenses, investments, and insurance.", icon: "💰" },
              { num: "3", title: "Investor Questionnaire", desc: "12-15 questions to discover your investor persona.", icon: "🧠" },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {step.num}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{step.icon}</span>
                    <h3 className="font-semibold text-slate-800">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleStart}
            className="gradient-btn text-white px-10 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all"
          >
            {hasInProgressSession ? "Resume My Profile" : "Get Started"}
            <span className="ml-2">&rarr;</span>
          </button>
          {hasInProgressSession && (
            <p className="text-xs text-gray-400 mt-2">
              You have an in-progress profile. We&apos;ll pick up where you left off.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
