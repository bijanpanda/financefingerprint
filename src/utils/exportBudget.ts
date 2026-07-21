import * as XLSX from "xlsx";
import { LineItem, ExpenseItem, Transaction, Currency } from "@/types";

interface ExportArgs {
  monthLabel: string;
  currency: Currency;
  incomeItems: LineItem[];
  expenseItems: ExpenseItem[];
  savingsItems: LineItem[];
  transactions: Transaction[];
}

function budgetRows(
  incomeItems: LineItem[],
  expenseItems: ExpenseItem[],
  savingsItems: LineItem[]
) {
  const rows: (string | number)[][] = [
    ["Category", "Sub-Head", "Item", "Planned", "Actual", "Remaining"],
  ];

  const addSection = (label: string, items: (LineItem | ExpenseItem)[]) => {
    items.forEach((item) => {
      const subHead = "subHead" in item ? item.subHead : "";
      rows.push([label, subHead, item.name, item.planned, item.actual, item.planned - item.actual]);
    });
    const totalPlanned = items.reduce((s, i) => s + i.planned, 0);
    const totalActual = items.reduce((s, i) => s + i.actual, 0);
    rows.push([`${label} Total`, "", "", totalPlanned, totalActual, totalPlanned - totalActual]);
    rows.push(["", "", "", "", "", ""]);
  };

  addSection("Income", incomeItems);
  addSection("Expense", expenseItems);
  addSection("Savings", savingsItems);

  return rows;
}

function transactionRows(transactions: Transaction[]) {
  const rows: (string | number)[][] = [
    ["Date", "Merchant", "Type", "Sub-Head", "Amount", "Comments"],
  ];
  transactions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) => {
      rows.push([t.date, t.merchantName, t.linkedItemType, t.linkedSubHead || "", t.amount, t.comments || ""]);
    });
  return rows;
}

export function exportBudgetToExcel({
  monthLabel,
  currency,
  incomeItems,
  expenseItems,
  savingsItems,
  transactions,
}: ExportArgs) {
  const wb = XLSX.utils.book_new();

  const budgetSheet = XLSX.utils.aoa_to_sheet(budgetRows(incomeItems, expenseItems, savingsItems));
  budgetSheet["!cols"] = [{ wch: 14 }, { wch: 20 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, budgetSheet, "Budget");

  const txnSheet = XLSX.utils.aoa_to_sheet(transactionRows(transactions));
  txnSheet["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, txnSheet, "Transactions");

  const fileName = `Vestrofin_Budget_${monthLabel.replace(/\s+/g, "_")}_${currency}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
