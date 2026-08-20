"use client";

import { useState } from "react";
import { Currency } from "@/types";
import { AssetAccount, AssetType } from "@/types/retirement";
import { ASSET_TYPES, blendedReturn, toBase, totalInBase } from "@/utils/retirementFx";
import { formatCurrency } from "@/utils/currency";
import { CURRENCIES } from "@/utils/currency";

interface Props {
  accounts: AssetAccount[];
  baseCurrency: Currency;
  onChange: (accounts: AssetAccount[]) => void;
}

function newAccount(): AssetAccount {
  return {
    id: `acct-${Date.now()}`,
    label: "",
    assetType: "other",
    currency: "USD",
    balance: 0,
    fxRate: 1,
    fxSource: "manual",
    fxAsOf: new Date().toISOString().slice(0, 10),
    expectedReturn: ASSET_TYPES.other.defaultReturn,
    availableFromAge: null,
  };
}

export default function AccountList({ accounts, baseCurrency, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  function update(id: string, patch: Partial<AssetAccount>) {
    onChange(accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function remove(id: string) {
    onChange(accounts.filter((a) => a.id !== id));
  }

  function add() {
    onChange([...accounts, newAccount()]);
  }

  const total = totalInBase(accounts, baseCurrency);
  const blended = accounts.length > 0 ? blendedReturn(accounts, baseCurrency) : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <span className="profile-label mb-0">
          Accounts · {formatCurrency(total, baseCurrency)}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {accounts.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">Blended expected return: {(blended * 100).toFixed(2)}%</p>
          )}

          {accounts.map((account) => (
            <div key={account.id} className="border border-slate-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="profile-input flex-1"
                  value={account.label}
                  onChange={(e) => update(account.id, { label: e.target.value })}
                />
                <button onClick={() => remove(account.id)} className="text-slate-400 hover:text-red-500 shrink-0 px-1" aria-label="Remove account">
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  className="profile-input"
                  value={account.assetType}
                  onChange={(e) => update(account.id, { assetType: e.target.value as AssetType })}
                >
                  {Object.entries(ASSET_TYPES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label}
                    </option>
                  ))}
                </select>
                <select
                  className="profile-input"
                  value={account.currency}
                  onChange={(e) => update(account.id, { currency: e.target.value as Currency })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  className="profile-input"
                  value={account.balance}
                  onChange={(e) => update(account.id, { balance: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="FX rate"
                  step="0.01"
                  disabled={account.currency === baseCurrency}
                  className="profile-input disabled:opacity-50"
                  value={account.fxRate}
                  onChange={(e) => update(account.id, { fxRate: Number(e.target.value), fxSource: "manual" })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Expected return %"
                  step="0.1"
                  className="profile-input"
                  value={(account.expectedReturn * 100).toFixed(2)}
                  onChange={(e) => update(account.id, { expectedReturn: Number(e.target.value) / 100 })}
                />
                <input
                  type="number"
                  placeholder="Available from age"
                  className="profile-input"
                  value={account.availableFromAge ?? ""}
                  onChange={(e) =>
                    update(account.id, {
                      availableFromAge: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>

              <p className="text-xs text-[var(--text-muted)]">
                {account.currency === baseCurrency
                  ? `${formatCurrency(account.balance, account.currency)} · in base currency`
                  : `${account.currency} ${account.balance.toLocaleString()} at ${account.fxRate} · ${formatCurrency(toBase(account, baseCurrency), baseCurrency)}`}
              </p>
            </div>
          ))}

          <button
            onClick={add}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-200 text-sm text-slate-400 hover:border-teal-300 hover:text-teal-600 transition-colors"
          >
            + Add account
          </button>
        </div>
      )}
    </div>
  );
}
