"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileSession } from "@/hooks/useProfileSession";
import ProgressStepper from "@/components/profile/ProgressStepper";
import QuestionCard from "@/components/profile/QuestionCard";
import DnaBackground from "@/components/profile/DnaBackground";
import { AnsweredQuestion } from "@/types/profile";

export default function ProfileQuestionnairePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { session, saveAnswer } = useProfileSession(user?.uid);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (session?.currentStep === "processing") {
      router.push("/profile/processing");
    }
  }, [session?.currentStep, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
      </div>
    );
  }

  const questions = session?.selectedQuestions || [];
  const currentIndex = session?.currentQuestionIndex || 0;
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No questions loaded. Please go back and restart.</p>
      </div>
    );
  }

  const handleAnswer = (answer: AnsweredQuestion) => {
    saveAnswer(answer);
  };

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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <ProgressStepper currentStep="questionnaire" />

        <div className="glass-card rounded-2xl p-8">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        </div>
      </div>
    </div>
  );
}
