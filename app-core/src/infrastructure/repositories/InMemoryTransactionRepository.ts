import { Transaction } from '@/core/domain/entities/Transaction';
import { ITransactionRepository } from '@/core/domain/repositories/ITransactionRepository';

export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Transaction[] = [];

  constructor(initialTransactions: Transaction[] = []) {
    this.transactions = [...initialTransactions];
  }

  async save(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async saveMany(transactions: Transaction[]): Promise<void> {
    this.transactions.push(...transactions);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((tx) => tx.id === id) ?? null;
  }

  async findByWalletId(walletId: string, limit = 50): Promise<Transaction[]> {
    return this.transactions
      .filter((tx) => tx.walletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async findAll(limit = 50): Promise<Transaction[]> {
    return [...this.transactions]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  public clear(): void {
    this.transactions = [];
  }
}
