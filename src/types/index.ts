
export type Category = 
  | "food"
  | "transport"
  | "entertainment"
  | "housing"
  | "utilities"
  | "healthcare"
  | "shopping"
  | "education"
  | "personal"
  | "other";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  groupId?: string; // Added for group expenses
  paidBy?: string; // User ID who paid
  splitWith?: string[]; // Array of user IDs to split with
  currency?: string; // Added currency field
}

export interface Budget {
  id: string;
  category: Category | 'total';
  limit: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  currency?: string; // Added currency field
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: Date;
  recurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  currency?: string; // Added currency field
}

export type ChartData = {
  name: string;
  value: number;
  color: string;
};

export type CategoryWithColor = {
  id: Category;
  name: string;
  color: string;
  icon: string;
}

export type ValueType = string | number;

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: Date;
  inviteCode: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface GroupExpense extends Expense {
  paidBy: string;
  splitMethod: 'equal' | 'percentage' | 'fixed';
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  paid: boolean;
}

export interface SettledDebt {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  date: Date;
  expenseId?: string;
  currency?: string;
}

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

