import { Wallet } from '@/core/domain/entities/Wallet';
import { IWalletRepository } from '@/core/domain/repositories/IWalletRepository';

export class InMemoryWalletRepository implements IWalletRepository {
  private wallets: Map<string, Wallet> = new Map();

  constructor(initialWallets: Wallet[] = []) {
    for (const w of initialWallets) {
      this.wallets.set(w.id, w);
    }
  }

  async findById(id: string): Promise<Wallet | null> {
    return this.wallets.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter((w) => w.userId === userId);
  }

  async findByUserAndCurrency(userId: string, currency: string): Promise<Wallet | null> {
    const normCurrency = currency.toUpperCase();
    return (
      Array.from(this.wallets.values()).find(
        (w) => w.userId === userId && w.currency === normCurrency
      ) ?? null
    );
  }

  async save(wallet: Wallet): Promise<void> {
    this.wallets.set(wallet.id, wallet);
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    const existing = this.wallets.get(id);
    if (existing) {
      // Re-create wallet with updated balance
      const updated = new Wallet({
        id: existing.id,
        userId: existing.userId,
        currency: existing.currency,
        name: existing.name,
        balance: newBalance,
        status: existing.status,
        createdAt: existing.createdAt,
        updatedAt: new Date(),
      });
      this.wallets.set(id, updated);
    }
  }

  public clear(): void {
    this.wallets.clear();
  }
}
