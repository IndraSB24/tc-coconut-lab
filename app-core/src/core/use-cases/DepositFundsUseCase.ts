import { IWalletRepository } from '../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../domain/repositories/ITransactionRepository';
import { Transaction } from '../domain/entities/Transaction';
import { Wallet } from '../domain/entities/Wallet';
import { InvalidAmountError, WalletNotFoundError } from '../domain/errors';
import { roundCurrency } from '../domain/utils/currency-math';

export interface DepositFundsDTO {
  walletId: string;
  amount: number;
  notes?: string;
  referenceId?: string;
}

export interface DepositFundsResult {
  wallet: Wallet;
  transaction: Transaction;
}

export class DepositFundsUseCase {
  constructor(
    private walletRepo: IWalletRepository,
    private transactionRepo: ITransactionRepository
  ) {}

  async execute(dto: DepositFundsDTO): Promise<DepositFundsResult> {
    if (typeof dto.amount !== 'number' || isNaN(dto.amount) || dto.amount <= 0) {
      throw new InvalidAmountError(dto.amount);
    }

    const wallet = await this.walletRepo.findById(dto.walletId);
    if (!wallet) {
      throw new WalletNotFoundError(dto.walletId);
    }

    const roundedAmount = roundCurrency(dto.amount, wallet.currency);
    const newBalance = wallet.deposit(roundedAmount);

    const referenceId =
      dto.referenceId || `dep-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const transaction = new Transaction({
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      walletId: wallet.id,
      type: 'DEPOSIT',
      amount: roundedAmount,
      currency: wallet.currency,
      balanceAfter: newBalance,
      referenceId,
      notes: dto.notes || `Simulated deposit of ${roundedAmount} ${wallet.currency}`,
      createdAt: new Date(),
    });

    await this.walletRepo.updateBalance(wallet.id, newBalance);
    await this.transactionRepo.save(transaction);

    return { wallet, transaction };
  }
}
