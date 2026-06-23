import { ExpenseSubHead } from "@/types";

export const DEFAULT_INCOME_ITEMS = [
  "Salary / Pay Cheque",
  "Rent Income",
];

export const DEFAULT_EXPENSE_ITEMS: Record<ExpenseSubHead, string[]> = {
  "Housing & Necessities": [
    "Rent",
    "Electric Bill",
    "Water Bill",
    "Internet Bill",
    "Mobile Recharge",
  ],
  Food: [
    "Groceries",
    "Milk",
    "Vegetables",
    "Snacks",
    "Desserts",
  ],
  Transportation: [
    "Gas / Petrol",
    "Uber",
    "Car Maintenance",
  ],
  Subscriptions: [
    "Netflix",
    "Google Subscription",
    "AI Subscription",
    "Amazon Subscription",
    "YouTube Subscription",
  ],
  Lifestyle: [
    "Movie Night",
    "Restaurant",
    "Miscellaneous",
  ],
  Insurance: [
    "Auto Insurance",
    "Health Insurance",
    "Term Insurance",
  ],
  Loans: [
    "Home Loan",
    "Vehicle Loan",
    "Personal Loan",
    "Gold Loan",
  ],
};

export const DEFAULT_SAVINGS_ITEMS = [
  "Emergency Savings",
  "Investment Savings",
];

export const EXPENSE_SUBHEAD_ORDER: ExpenseSubHead[] = [
  "Housing & Necessities",
  "Food",
  "Transportation",
  "Subscriptions",
  "Lifestyle",
  "Insurance",
  "Loans",
];
