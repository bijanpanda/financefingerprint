"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSession } from "@/hooks/useProfileSession";
import { calculatePersonaScore, generateLocalSynthesis } from "@/utils/scoring";
import { getCurrentFinancialYear } from "@/utils/questionBank";
import { saveProfile, getLatestProfile } from "@/lib/profileDb";
import ProcessingScreen from "@/components/profile/ProcessingScreen";
import DnaBackground from "@/components/profile/DnaBackground";
import {
  IdentityProfile,
  FinancialProfile,
  CustomerProfile,
  InvestorPersona,
  AISynthesis,
} from "@/types/profile";
import { Currency } from "@/types";

function nextProfileVersion(previousProfile: CustomerProfile | null, currentFY: string): string {
  if (previousProfile && previousProfile.financialYear === currentFY) {
    const match = previousProfile.profileVersion.match(/^v(\d+)/);
    const prevNum = match ? parseInt(match[1], 10) : 1;
    return `v${prevNum + 1}-FY${currentFY}`;
  }
  return `v1-FY${currentFY}`;
}

async function synthesizeViaApi(
  identity: IdentityProfile,
  financial: FinancialProfile,
  persona: InvestorPersona,
  previousProfile: CustomerProfile | null,
  currency: Currency
): Promise<AISynthesis> {
  try {
    const res = await fetch("/api/profile/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, financial, persona, previousProfile, currency }),
    });
    if (!res.ok) throw new Error(`synthesize endpoint returned ${res.status}`);
    const data = await res.json();
    return data.synthesis as AISynthesis;
  } catch (err) {
    // Endpoint unreachable (offline, etc.) — fall back to the local template synthesis
    // so the profiling flow always completes.
    console.error("profile/synthesize request failed, using local fallback:", err);
    return generateLocalSynthesis(identity, financial, persona);
  }
}

export default function ProfileProcessingPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();
  const { session, clearSession } = useProfileSession(user?.uid);
  const processedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !session || processedRef.current) return;
    if (!session.answers || !session.identityData || !session.financialData) return;

    processedRef.current = true;

    const processProfile = async () => {
      try {
        const identity = session.identityData as IdentityProfile;
        const financial = session.financialData as FinancialProfile;
        const answers = session.answers!;

        const persona = calculatePersonaScore(answers);
        const previousProfile = await getLatestProfile(user.uid);
        const synthesis = await synthesizeViaApi(identity, financial, persona, previousProfile, currency);

        const fy = getCurrentFinancialYear();
        const profile: CustomerProfile = {
          profileId: `${user.uid}-${fy}`,
          userId: user.uid,
          profileVersion: nextProfileVersion(previousProfile, fy),
          financialYear: fy,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "complete",
          identity,
          financial,
          persona,
          aiSynthesis: synthesis,
          ...(previousProfile ? { previousProfileId: previousProfile.profileId } : {}),
          ...(synthesis.driftSummary ? { driftSummary: synthesis.driftSummary } : {}),
        };

        await saveProfile(user.uid, profile);
        clearSession();

        setTimeout(() => {
          router.push("/profile/reveal");
        }, 3000);
      } catch (err) {
        console.error("Failed to finalize profile:", err);
        processedRef.current = false;
        setError("Something went wrong while building your Financial DNA. Please try again.");
      }
    };

    processProfile();
  }, [user, session, clearSession, router, retryCount, currency]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            processedRef.current = false;
            setRetryCount((c) => c + 1);
          }}
          className="gradient-btn text-white px-6 py-2 rounded-xl text-sm font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient-bg relative">
      <DnaBackground />
      <ProcessingScreen />
    </div>
  );
}
