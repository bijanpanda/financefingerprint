"use client";

import { Transaction, Currency } from "@/types";
import { formatCurrency } from "@/utils/currency";

interface Props {
  transactions: Transaction[];
  currency: Currency;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, currency, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-gray-400 text-sm">
        No transactions logged yet. Use the form above to log your first transaction.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
          <tr>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
            <th className="text-right px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-2 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id} className="border-t border-gray-50 hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-2.5 text-[13px] text-slate-600">{txn.date}</td>
              <td className="px-4 py-2.5 text-[13px] text-slate-700 font-medium">{txn.merchantName}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  txn.linkedItemType === "income"
                    ? "bg-emerald-100 text-emerald-700"
                    : txn.linkedItemType === "savings"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-rose-100 text-rose-700"
                }`}>
                  {txn.linkedItemType}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-slate-700">{formatCurrency(txn.amount, currency)}</td>
              <td className="px-2 py-2.5">
                <button onClick={() => onDelete(txn.id)} className="text-gray-300 hover:text-rose-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
