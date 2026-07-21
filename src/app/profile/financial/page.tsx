"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSession } from "@/hooks/useProfileSession";
import { prefillFromBudget } from "@/lib/profileDb";
import { selectQuestionsForSession, getQuestionBank } from "@/utils/questionBank";
import { selectSpendingQuestionsForSession, getSpendingQuestionBank } from "@/utils/spendingQuestionBank";
import ProgressStepper from "@/components/profile/ProgressStepper";
import FinancialForm from "@/components/profile/FinancialForm";
import SpendingQuestionCard from "@/components/profile/SpendingQuestionCard";
import DnaBackground from "@/components/profile/DnaBackground";
import { FinancialProfile, SpendingAnswer } from "@/types/profile";

export default function ProfileFinancialPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();
  const { session, startSession, saveFinancial, saveSpendingAnswer } = useProfileSession(user?.uid);
  const [budgetData, setBudgetData] = useState<{ totalExpenses: number; totalEMIs: number; totalIncome: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user && !session) {
      startSession();
    }
  }, [user, authLoading, router, session, startSession]);

  useEffect(() => {
    if (user) {
      prefillFromBudget(user.uid).then((data) => {
        setBudgetData(data);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (session?.currentStep === "questionnaire") {
      router.push("/profile/questionnaire");
    }
  }, [session?.currentStep, router]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  const handleFinancialSubmit = (data: FinancialProfile) => {
    const questions = selectQuestionsForSession(getQuestionBank(currency));
    const spendingQuestions = selectSpendingQuestionsForSession(getSpendingQuestionBank(currency));
    saveFinancial(data, questions, spendingQuestions);
  };

  const handleSpendingAnswer = (answer: SpendingAnswer) => {
    saveSpendingAnswer(answer);
  };

  const isSpendingStep = session?.currentStep === "spending";
  const spendingQuestions = session?.selectedSpendingQuestions || [];
  const spendingIndex = session?.spendingQuestionIndex || 0;
  const currentSpendingQuestion = spendingQuestions[spendingIndex];

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
          <span className="text-sm text-gray-500">Financial DNA</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <ProgressStepper currentStep="financial" />

        {!isSpendingStep && (
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-2xl font-extrabold gradient-text mb-1">Financial Profile</h1>
            <p className="text-base text-gray-500 mb-6">Help us understand your financial reality so we can tailor our recommendations.</p>

            <FinancialForm
              initialData={session?.financialData}
              budgetPrefill={budgetData}
              onSubmit={handleFinancialSubmit}
            />
          </div>
        )}

        {isSpendingStep && currentSpendingQuestion && (
          <div className="glass-card rounded-2xl p-8">
            <h1 className="text-xl font-extrabold gradient-text mb-1">Your Money Habits</h1>
            <p className="text-base text-gray-500 mb-6">A few quick questions about your day-to-day money habits&hellip;</p>

            <SpendingQuestionCard
              key={currentSpendingQuestion.id}
              question={currentSpendingQuestion}
              questionNumber={spendingIndex + 1}
              totalQuestions={spendingQuestions.length}
              onAnswer={handleSpendingAnswer}
            />
          </div>
        )}
      </div>
    </div>
  );
}
