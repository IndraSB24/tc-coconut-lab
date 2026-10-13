export interface WalletData {
  id: string;
  userId: string;
  currency: string;
  name?: string;
  balance: number;
  formattedBalance: string;
  status: string;
}

export interface TransactionData {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  referenceId: string;
  counterpartyWalletId?: string | null;
  counterpartyCurrency?: string | null;
  exchangeRate?: number | null;
  notes?: string | null;
  createdAt: string;
}

export interface LiveRate {
  base: string;
  quote: string;
  rate: number;
  provider: string;
  cached: boolean;
}

export type ActionTab = 'deposit' | 'withdraw' | 'convert' | 'transfer';
