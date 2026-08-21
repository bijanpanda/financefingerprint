"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  defaultCountryForCurrency,
  getRetirementPlan,
  saveRetirementPlan,
  saveVersion,
  getVersions,
  RetirementPlanDoc,
  PlanVersion,
} from "@/lib/retirementDb";
import { deriveAnnualExpense, deriveAnnualSavings } from "@/utils/retirementFromBudget";
import { totalInBase, blendedReturn } from "@/utils/retirementFx";
import { project, solveFor, solveForBareSurvival, stressOnePointLower } from "@/utils/retirementEngine";
import { SolveLever } from "@/types/retirement";
import AssumptionsRail from "@/components/retirement/AssumptionsRail";
import AccountList from "@/components/retirement/AccountList";
import IncomeList from "@/components/retirement/IncomeList";
import GoalList from "@/components/retirement/GoalList";
import VerdictBanner from "@/components/retirement/VerdictBanner";
import RunwayChart from "@/components/retirement/RunwayChart";
import LedgerTable from "@/components/retirement/LedgerTable";
import VersionHistory from "@/components/retirement/VersionHistory";

const SAVE_DEBOUNCE_MS = 800;

function defaultPlan(currency: RetirementPlanDoc["baseCurrency"]): RetirementPlanDoc {
  return {
    currentAge: 30,
    country: defaultCountryForCurrency(currency),
    baseCurrency: currency,
    currentBalance: 0,
    lifeExpectancy: 85,
    retirementAge: 60,
    inflationRate: 0.06,
    returnRatePre: 0.08,
    returnRatePost: 0.065,
    annualSavings: 0,
    savingsMode: "indexed",
    incomeStreams: [],
    annualLivingExpense: 0,
    goals: [],
    accounts: [],
    livingExpenseSource: "manual",
    livingExpenseDerivedAt: null,
  };
}

export default function RetirementPage() {
  const { user, currency, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plan, setPlan] = useState<RetirementPlanDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [savingVersion, setSavingVersion] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    if (!user) return;

    (async () => {
      const [existing, existingVersions] = await Promise.all([getRetirementPlan(user.uid), getVersions(user.uid)]);
      setVersions(existingVersions);

      if (existing) {
        setPlan(existing);
        setLoading(false);
        return;
      }
      const fresh = defaultPlan(currency);
      const derivedExpense = await deriveAnnualExpense(user.uid);
      const derivedSavings = await deriveAnnualSavings(user.uid);
      setPlan({
        ...fresh,
        annualLivingExpense: derivedExpense.annual ?? 0,
        livingExpenseSource: derivedExpense.source,
        livingExpenseDerivedAt: derivedExpense.annual != null ? new Date().toISOString() : null,
        annualSavings: derivedSavings.annual ?? 0,
      });
      setLoading(false);
    })();
  }, [user, authLoading, router, currency]);

  const updatePlan = useCallback((patch: Partial<RetirementPlanDoc> | ((prev: RetirementPlanDoc) => RetirementPlanDoc)) => {
    setPlan((prev) => {
      if (!prev) return prev;
      const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      if (!user) return next;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveRetirementPlan(user.uid, next);
      }, SAVE_DEBOUNCE_MS);
      return next;
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Accounts, when present, drive the corpus and its blended pre-retirement
  // return — never re-derived inside the projection loop, computed once here.
  const effectivePlan = useMemo(() => {
    if (!plan) return null;
    if (plan.accounts.length === 0) return plan;
    return {
      ...plan,
      currentBalance: totalInBase(plan.accounts, plan.baseCurrency),
    };
  }, [plan]);

  const projection = useMemo(() => (effectivePlan ? project(effectivePlan) : null), [effectivePlan]);

  const solveTiles = useMemo(() => {
    if (!effectivePlan) return null;
    const levers: SolveLever[] = ["savings", "returnPre", "income", "retirementAge", "livingExpense"];
    const values: Partial<Record<SolveLever, number | null>> = {};
    for (const lever of levers) values[lever] = solveFor(effectivePlan, lever);
    return values;
  }, [effectivePlan]);

  const bareSurvivalSavings = useMemo(
    () => (effectivePlan ? solveForBareSurvival(effectivePlan, "savings") : null),
    [effectivePlan]
  );

  const stressDepletionAge = useMemo(
    () => (effectivePlan ? stressOnePointLower(effectivePlan) : null),
    [effectivePlan]
  );

  const blendedAccountReturn = useMemo(
    () => (plan && plan.accounts.length > 0 ? blendedReturn(plan.accounts, plan.baseCurrency) : null),
    [plan]
  );

  async function handleSaveVersion() {
    if (!user || !plan) return;
    setSavingVersion(true);
    // Flush any pending debounced draft save first so the version snapshot
    // and the "current" doc never disagree.
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await saveRetirementPlan(user.uid, plan);
    await saveVersion(user.uid, plan);
    const fresh = await getVersions(user.uid);
    setVersions(fresh);
    setSavingVersion(false);
  }

  function handleRestore(restored: RetirementPlanDoc) {
    updatePlan(() => restored);
  }

  function applySolve(lever: SolveLever, value: number) {
    if (lever === "savings") updatePlan({ annualSavings: value });
    else if (lever === "returnPre") updatePlan({ returnRatePre: value });
    else if (lever === "retirementAge") updatePlan({ retirementAge: Math.round(value) });
    else if (lever === "livingExpense") updatePlan({ annualLivingExpense: value, livingExpenseSource: "manual" });
    else if (lever === "income") {
      updatePlan((prev) => {
        const streams = [...prev.incomeStreams];
        if (streams.length > 0) streams[0] = { ...streams[0], amountPerYear: value };
        return { ...prev, incomeStreams: streams };
      });
    }
  }

  if (authLoading || loading || !plan || !effectivePlan || !projection) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--surface-1)]">
        <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--surface-1)]">
      <nav className="nav-sidebar w-[220px] shrink-0 flex-col py-5 px-3 hidden lg:flex">
        <div className="flex items-center gap-2.5 px-2 mb-7">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center shrink-0 shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <div className="leading-tight">
            <span className="text-[16px] font-bold text-slate-800 block">Vestro</span>
            <span className="text-[16px] font-bold text-slate-500 block -mt-1">fin</span>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Plan</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mb-1"
        >
          Budget Planning
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-[var(--bg-success)] text-white shadow-sm mb-1">
          Retirement Runway
        </button>
        <div className="flex-1" />
        <p className="px-3 text-[12px] text-slate-400 truncate mt-2">{user?.email}</p>
      </nav>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center px-4 lg:px-5 bg-white border-b border-[var(--border-default)] gap-4">
          <button onClick={() => router.push("/dashboard")} className="lg:hidden text-slate-500" aria-label="Back">
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-slate-800 truncate">Retirement Runway</p>
            <p className="text-[12px] text-slate-400">Will your money outlive you?</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            <main className="flex-1 min-w-0 order-1 lg:order-2 px-4 lg:px-6 py-5 space-y-4 max-w-4xl mx-auto w-full">
              <VerdictBanner
                plan={effectivePlan}
                projection={projection}
                currency={plan.baseCurrency}
                solveTiles={solveTiles}
                bareSurvivalSavings={bareSurvivalSavings}
                stressDepletionAge={stressDepletionAge}
                onApply={applySolve}
              />
              <RunwayChart projection={projection} plan={effectivePlan} currency={plan.baseCurrency} />
              <LedgerTable projection={projection} currency={plan.baseCurrency} retirementAge={plan.retirementAge} />
            </main>

            <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-1 px-4 lg:px-4 py-5 space-y-4 border-b lg:border-b-0 lg:border-r border-[var(--border-default)]">
              <VersionHistory
                versions={versions}
                saving={savingVersion}
                onSave={handleSaveVersion}
                onRestore={handleRestore}
              />
              <AssumptionsRail
                plan={plan}
                userId={user!.uid}
                blendedAccountReturn={blendedAccountReturn}
                onChange={updatePlan}
              />
              <AccountList
                accounts={plan.accounts}
                baseCurrency={plan.baseCurrency}
                onChange={(accounts) => updatePlan({ accounts })}
              />
              <IncomeList
                streams={plan.incomeStreams}
                onChange={(incomeStreams) => updatePlan({ incomeStreams })}
              />
              <GoalList
                goals={plan.goals}
                currentAge={plan.currentAge}
                countryInflationRate={plan.inflationRate}
                baseCurrency={plan.baseCurrency}
                onChange={(goals) => updatePlan({ goals })}
              />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
