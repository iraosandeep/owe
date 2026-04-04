export type TransactionType = "given" | "taken";

export interface Transaction {
  id: string;
  personName: string;
  phone: string | null;
  amount: number;
  type: TransactionType;
  interest: number | null;
  date: string; // ISO string
  createdAt: string; // ISO string
}

export interface PersonSummary {
  personName: string;
  phone: string | null;
  totalGiven: number;
  totalTaken: number;
  netBalance: number; // positive = they owe you, negative = you owe them
  transactionCount: number;
}

export interface DashboardSummary {
  totalGiven: number;
  totalTaken: number;
  netBalance: number;
}
