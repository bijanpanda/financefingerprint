"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ProfileSession,
  IdentityProfile,
  FinancialProfile,
  Question,
  AnsweredQuestion,
  SpendingQuestion,
  SpendingAnswer,
} from "@/types/profile";
import { calculateSpendingScore } from "@/utils/spendingScoring";

const STORAGE_KEY_PREFIX = "profile-session-";

function getStorageKey(uid: string): string {
  return `${STORAGE_KEY_PREFIX}${uid}`;
}

function loadSession(uid: string): ProfileSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey(uid));
    if (!raw) return null;
    return JSON.parse(raw) as ProfileSession;
  } catch {
    return null;
  }
}

function persistSession(uid: string, session: ProfileSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(uid), JSON.stringify(session));
}

export function useProfileSession(uid: string | undefined) {
  const [session, setSession] = useState<ProfileSession | null>(() =>
    uid ? loadSession(uid) : null
  );

  // The useState initializer above only runs once, on the first render — if `uid`
  // is still undefined then (e.g. auth hasn't resolved yet on a hard reload), the
  // session never gets loaded. Re-load whenever `uid` actually becomes available.
  useEffect(() => {
    if (uid) {
      setSession(loadSession(uid));
    }
  }, [uid]);

  const save = useCallback(
    (updated: ProfileSession) => {
      if (!uid) return;
      setSession(updated);
      persistSession(uid, updated);
    },
    [uid]
  );

  const startSession = useCallback(() => {
    if (!uid) return;
    const existing = loadSession(uid);
    if (existing) {
      setSession(existing);
      return;
    }
    const newSession: ProfileSession = {
      userId: uid,
      currentStep: "identity",
      startedAt: Date.now(),
    };
    save(newSession);
  }, [uid, save]);

  const saveIdentity = useCallback(
    (data: IdentityProfile) => {
      if (!session) return;
      save({ ...session, identityData: data, currentStep: "financial" });
    },
    [session, save]
  );

  const saveFinancial = useCallback(
    (data: FinancialProfile, questions: Question[], spendingQuestions: SpendingQuestion[]) => {
      if (!session) return;
      save({
        ...session,
        financialData: data,
        selectedQuestions: questions,
        answers: [],
        currentQuestionIndex: 0,
        selectedSpendingQuestions: spendingQuestions,
        spendingAnswers: [],
        spendingQuestionIndex: 0,
        currentStep: "spending",
      });
    },
    [session, save]
  );

  const saveSpendingAnswer = useCallback(
    (answer: SpendingAnswer) => {
      if (!session) return;
      const spendingAnswers = [...(session.spendingAnswers || []), answer];
      const nextIndex = (session.spendingQuestionIndex || 0) + 1;
      const totalQuestions = session.selectedSpendingQuestions?.length || 0;
      const isLast = nextIndex >= totalQuestions;

      if (!isLast) {
        save({ ...session, spendingAnswers, spendingQuestionIndex: nextIndex, currentStep: "spending" });
        return;
      }

      // All spending questions answered — fold the resulting SpendingPersona into
      // financialData, then move on to the investor questionnaire.
      const spendingPersona = calculateSpendingScore(spendingAnswers);
      save({
        ...session,
        spendingAnswers,
        spendingQuestionIndex: nextIndex,
        financialData: { ...session.financialData, spendingPersona },
        currentStep: "questionnaire",
      });
    },
    [session, save]
  );

  const saveAnswer = useCallback(
    (answer: AnsweredQuestion) => {
      if (!session) return;
      const answers = [...(session.answers || []), answer];
      const nextIndex = (session.currentQuestionIndex || 0) + 1;
      const totalQuestions = session.selectedQuestions?.length || 0;
      const isLast = nextIndex >= totalQuestions;
      save({
        ...session,
        answers,
        currentQuestionIndex: nextIndex,
        currentStep: isLast ? "processing" : "questionnaire",
      });
    },
    [session, save]
  );

  const clearSession = useCallback(() => {
    if (!uid) return;
    localStorage.removeItem(getStorageKey(uid));
    setSession(null);
  }, [uid]);

  return {
    session,
    startSession,
    saveIdentity,
    saveFinancial,
    saveSpendingAnswer,
    saveAnswer,
    clearSession,
  };
}
