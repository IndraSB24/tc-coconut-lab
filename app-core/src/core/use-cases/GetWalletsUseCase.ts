import { IWalletRepository } from '../domain/repositories/IWalletRepository';
import { Wallet } from '../domain/entities/Wallet';

export interface GetWalletsResult {
  userId: string;
  wallets: Wallet[];
  balances: Record<string, number>;
}

export class GetWalletsUseCase {
  constructor(private walletRepo: IWalletRepository) {}

  async execute(userId: string): Promise<GetWalletsResult> {
    const wallets = await this.walletRepo.findByUserId(userId);
    const balances: Record<string, number> = {};

    for (const w of wallets) {
      balances[w.currency] = w.balance;
    }

    return {
      userId,
      wallets,
      balances,
    };
  }
}
