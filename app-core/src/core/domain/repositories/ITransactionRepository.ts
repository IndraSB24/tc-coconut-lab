import { Transaction } from '../entities/Transaction';

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  saveMany(transactions: Transaction[]): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByWalletId(walletId: string, limit?: number): Promise<Transaction[]>;
  findAll(limit?: number): Promise<Transaction[]>;
}
