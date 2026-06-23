export type Currency = "INR" | "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "SGD" | "AED";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  currency: Currency;
  createdAt: Date;
}

export type ExpenseSubHead =
  | "Housing & Necessities"
  | "Food"
  | "Transportation"
  | "Subscriptions"
  | "Lifestyle"
  | "Insurance"
  | "Loans";

export interface LineItem {
  id: string;
  name: string;
  planned: number;
  actual: number;
  order: number;
}

export interface ExpenseItem extends LineItem {
  subHead: ExpenseSubHead;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  merchantName: string;
  comments?: string;
  linkedItemId: string;
  linkedItemType: "income" | "expense" | "savings";
  linkedSubHead?: ExpenseSubHead;
  createdAt: Date;
}

export interface BudgetMonth {
  id: string;
  month: number;
  year: number;
  createdAt: Date;
}
