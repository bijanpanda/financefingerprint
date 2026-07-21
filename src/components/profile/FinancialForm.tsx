"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FinancialProfile,
  IncomeStability,
  InvestmentType,
  InsuranceType,
  EmergencyFundStatus,
} from "@/types/profile";
import { calculateFinancialMetrics } from "@/utils/scoring";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrencySymbol } from "@/utils/currency";
import FinancialHealthMeter from "./FinancialHealthMeter";

interface Props {
  initialData?: Partial<FinancialProfile>;
  budgetPrefill?: { totalExpenses: number; totalEMIs: number; totalIncome: number } | null;
  onSubmit: (data: FinancialProfile) => void;
}

const INVESTMENT_OPTIONS: { value: InvestmentType; label: string }[] = [
  { value: "mutual_funds", label: "Mutual Funds" },
  { value: "stocks", label: "Stocks" },
  { value: "fixed_deposit", label: "Fixed Deposits" },
  { value: "real_estate", label: "Real Estate" },
  { value: "gold", label: "Gold" },
  { value: "ppf_epf", label: "PPF / EPF" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "none", label: "None" },
];

const INSURANCE_OPTIONS: { value: InsuranceType; label: string }[] = [
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "vehicle", label: "Vehicle Insurance" },
  { value: "home", label: "Home Insurance" },
  { value: "none", label: "None" },
];

export default function FinancialForm({ initialData, budgetPrefill, onSubmit }: Props) {
  const { currency } = useAuth();
  const currencySymbol = getCurrencySymbol(currency);
  const [income, setIncome] = useState<number>(initialData?.monthlyGrossIncome || 0);
  const [stability, setStability] = useState<IncomeStability>(initialData?.incomeStability || "fixed");
  const [hasSecondary, setHasSecondary] = useState(initialData?.hasSecondaryIncome || false);
  const [secondaryAmount, setSecondaryAmount] = useState(initialData?.secondaryIncomeAmount || 0);
  const [expenses, setExpenses] = useState(initialData?.monthlyFixedExpenses || 0);
  const [emis, setEmis] = useState(initialData?.existingEMIs || 0);
  const [investments, setInvestments] = useState<InvestmentType[]>(initialData?.existingInvestments || []);
  const [insurance, setInsurance] = useState<InsuranceType[]>(initialData?.insuranceCoverage || []);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFundStatus>(initialData?.emergencyFundStatus || "none");
  const [prefillApplied, setPrefillApplied] = useState(false);

  const metrics = calculateFinancialMetrics({
    monthlyGrossIncome: income,
    monthlyFixedExpenses: expenses,
    existingEMIs: emis,
    emergencyFundStatus: emergencyFund,
    insuranceCoverage: insurance,
    existingInvestments: investments,
  });

  const applyPrefill = useCallback(() => {
    if (!budgetPrefill) return;
    setExpenses(Math.round(budgetPrefill.totalExpenses));
    setEmis(Math.round(budgetPrefill.totalEMIs));
    setPrefillApplied(true);
  }, [budgetPrefill]);

  useEffect(() => {
    if (budgetPrefill && !prefillApplied && !initialData?.monthlyFixedExpenses) {
      // Don't auto-apply, show prompt
    }
  }, [budgetPrefill, prefillApplied, initialData]);

  const toggleInvestment = (inv: InvestmentType) => {
    if (inv === "none") {
      setInvestments(["none"]);
      return;
    }
    setInvestments((prev) => {
      const filtered = prev.filter((i) => i !== "none");
      return filtered.includes(inv) ? filtered.filter((i) => i !== inv) : [...filtered, inv];
    });
  };

  const toggleInsurance = (ins: InsuranceType) => {
    if (ins === "none") {
      setInsurance(["none"]);
      return;
    }
    setInsurance((prev) => {
      const filtered = prev.filter((i) => i !== "none");
      return filtered.includes(ins) ? filtered.filter((i) => i !== ins) : [...filtered, ins];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      monthlyGrossIncome: income,
      incomeStability: stability,
      hasSecondaryIncome: hasSecondary,
      secondaryIncomeAmount: hasSecondary ? secondaryAmount : undefined,
      monthlyFixedExpenses: expenses,
      existingEMIs: emis,
      existingInvestments: investments.length > 0 ? investments : ["none"],
      insuranceCoverage: insurance.length > 0 ? insurance : ["none"],
      emergencyFundStatus: emergencyFund,
      debtToIncomeRatio: metrics.debtToIncomeRatio,
      savingsCapacityScore: metrics.savingsCapacityScore,
      financialHealthScore: metrics.financialHealthScore,
    });
  };

  const inputClass = "profile-input";
  const labelClass = "profile-label";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Budget prefill prompt */}
      {budgetPrefill && !prefillApplied && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-800">We found your budget data!</p>
            <p className="text-xs text-teal-600">Want us to pre-fill your expenses and EMI amounts?</p>
          </div>
          <button
            type="button"
            onClick={applyPrefill}
            className="gradient-btn text-white px-4 py-1.5 rounded-lg text-xs font-medium"
          >
            Yes, use it
          </button>
        </div>
      )}

      {/* Health Meter */}
      <div className="flex justify-center py-2">
        <FinancialHealthMeter score={metrics.financialHealthScore} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly Gross Income */}
        <div>
          <label className={labelClass}>
            Monthly Gross Income ({currencySymbol}) <span className="text-rose-500">*</span>
          </label>
          <input type="number" min={0} value={income} onChange={(e) => setIncome(Math.round(parseFloat(e.target.value) || 0))} required className={inputClass} />
        </div>

        {/* Income Stability */}
        <div>
          <label className={labelClass}>Income Stability</label>
          <select value={stability} onChange={(e) => setStability(e.target.value as IncomeStability)} className={inputClass}>
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>

        {/* Secondary Income */}
        <div>
          <label className={labelClass}>Secondary Income?</label>
          <select value={hasSecondary ? "yes" : "no"} onChange={(e) => setHasSecondary(e.target.value === "yes")} className={inputClass}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {hasSecondary && (
          <div>
            <label className={labelClass}>Secondary Income Amount ({currencySymbol})</label>
            <input type="number" min={0} value={secondaryAmount} onChange={(e) => setSecondaryAmount(Math.round(parseFloat(e.target.value) || 0))} className={inputClass} />
          </div>
        )}

        {/* Monthly Fixed Expenses */}
        <div>
          <label className={labelClass}>
            Monthly Fixed Expenses ({currencySymbol}) <span className="text-rose-500">*</span>
          </label>
          <input type="number" min={0} value={expenses} onChange={(e) => setExpenses(Math.round(parseFloat(e.target.value) || 0))} required className={inputClass} />
        </div>

        {/* Existing EMIs */}
        <div>
          <label className={labelClass}>
            Existing EMIs / Month ({currencySymbol})
          </label>
          <input type="number" min={0} value={emis} onChange={(e) => setEmis(Math.round(parseFloat(e.target.value) || 0))} className={inputClass} />
          {metrics.debtToIncomeRatio > 40 && (
            <p className="text-xs text-rose-600 mt-1">
              Your debt-to-income ratio ({metrics.debtToIncomeRatio}%) is high. Consider a plan to reduce EMIs.
            </p>
          )}
        </div>

        {/* Emergency Fund */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Emergency Fund Status</label>
          <select value={emergencyFund} onChange={(e) => setEmergencyFund(e.target.value as EmergencyFundStatus)} className={inputClass}>
            <option value="none">No Emergency Fund</option>
            <option value="below_3m">Below 3 Months of Expenses</option>
            <option value="3_to_6m">3 to 6 Months of Expenses</option>
            <option value="above_6m">Above 6 Months of Expenses</option>
          </select>
        </div>
      </div>

      {/* Existing Investments */}
      <div>
        <label className={labelClass}>Existing Investments (select all that apply)</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {INVESTMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleInvestment(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                investments.includes(opt.value)
                  ? "bg-teal-100 border-teal-400 text-teal-800"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insurance Coverage */}
      <div>
        <label className={labelClass}>Insurance Coverage (select all that apply)</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {INSURANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleInsurance(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                insurance.includes(opt.value)
                  ? "bg-blue-100 border-blue-400 text-blue-800"
                  : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Derived metrics display */}
      <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-500">Debt-to-Income</div>
          <div className={`text-lg font-bold ${metrics.debtToIncomeRatio > 40 ? "text-rose-600" : "text-slate-700"}`}>
            {metrics.debtToIncomeRatio}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Savings Capacity</div>
          <div className={`text-lg font-bold ${metrics.savingsCapacityScore < 10 ? "text-rose-600" : "text-slate-700"}`}>
            {metrics.savingsCapacityScore}%
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Health Score</div>
          <div className={`text-lg font-bold ${metrics.financialHealthScore >= 70 ? "text-teal-600" : metrics.financialHealthScore >= 40 ? "text-amber-600" : "text-rose-600"}`}>
            {metrics.financialHealthScore}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="gradient-btn text-white px-8 py-2.5 rounded-xl font-medium text-sm">
          Next &mdash; Discover My Investor Type &rarr;
        </button>
      </div>
    </form>
  );
}
