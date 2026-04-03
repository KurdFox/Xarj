export type Currency = 'IQD';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  emoji?: string;
  preferredCurrency: Currency;
}

export interface Transaction {
  id?: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  currency: Currency;
  category: string;
  note: string;
  date: any; // Firestore Timestamp
  receiptUrl?: string;
}

export interface Debt {
  id?: string;
  userId: string;
  personName: string;
  amount: number;
  currency: Currency;
  type: 'lent' | 'borrowed';
  status: 'pending' | 'paid';
  date: any; // Firestore Timestamp
  note: string;
}

export interface SavingGoal {
  id?: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadline?: any; // Firestore Timestamp
  icon: string;
  note?: string;
  createdAt: any; // Firestore Timestamp
}
