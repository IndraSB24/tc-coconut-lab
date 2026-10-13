import { Wallet } from '../entities/Wallet';

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet[]>;
  findByUserAndCurrency(userId: string, currency: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
  updateBalance(id: string, newBalance: number): Promise<void>;
}
