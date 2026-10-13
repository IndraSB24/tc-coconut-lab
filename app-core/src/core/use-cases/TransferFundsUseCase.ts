import { IWalletRepository } from '../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../domain/repositories/ITransactionRepository';
import { IExchangeRateService } from '../domain/services/IExchangeRateService';
import { Transaction } from '../domain/entities/Transaction';
import { Wallet } from '../domain/entities/Wallet';
import {
  CurrencyMismatchTransferError,
  InvalidAmountError,
  SelfTransferError,
  WalletNotFoundError,
} from '../domain/errors';
import { roundCurrency } from '../domain/utils/currency-math';

export interface TransferFundsDTO {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  notes?: string;
  referenceId?: string;
}

export interface TransferFundsResult {
  referenceId: string;
  fromWallet: Wallet;
  toWallet: Wallet;
  amountTransferred: number;
  effectiveRate: number;
  receivedAmount: number;
  transactions: [Transaction, Transaction];
}

export class TransferFundsUseCase {
  constructor(
    private walletRepo: IWalletRepository,
    private transactionRepo: ITransactionRepository,
    private exchangeRateService?: IExchangeRateService
  ) {}

  async execute(dto: TransferFundsDTO): Promise<TransferFundsResult> {
    if (dto.fromWalletId === dto.toWalletId) {
      throw new SelfTransferError();
    }

    if (typeof dto.amount !== 'number' || isNaN(dto.amount) || dto.amount <= 0) {
      throw new InvalidAmountError(dto.amount);
    }

    const fromWallet = await this.walletRepo.findById(dto.fromWalletId);
    if (!fromWallet) {
      throw new WalletNotFoundError(dto.fromWalletId);
    }

    const toWallet = await this.walletRepo.findById(dto.toWalletId);
    if (!toWallet) {
      throw new WalletNotFoundError(dto.toWalletId);
    }

    // Strict Invariant: Transfers are strictly 1:1 between same-currency wallets.
    // Cross-currency conversion must be executed via ConvertFundsUseCase.
    if (fromWallet.currency !== toWallet.currency) {
      throw new CurrencyMismatchTransferError(fromWallet.currency, toWallet.currency);
    }

    const amountTransferred = roundCurrency(dto.amount, fromWallet.currency);
    const effectiveRate = 1.0;
    const receivedAmount = amountTransferred;

    // 2. Debit from sender and credit to receiver (enforces non-negative balance)
    const newFromBalance = fromWallet.withdraw(amountTransferred);
    const newToBalance = toWallet.deposit(receivedAmount);

    // 3. Generate shared reference ID
    const referenceId =
      dto.referenceId || `txf-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const txTypeOut = 'TRANSFER_OUT';
    const txTypeIn = 'TRANSFER_IN';

    // 4. Create atomic ledger records
    const txOut = new Transaction({
      id: `tx-out-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      walletId: fromWallet.id,
      type: txTypeOut,
      amount: amountTransferred,
      currency: fromWallet.currency,
      balanceAfter: newFromBalance,
      referenceId,
      counterpartyWalletId: toWallet.id,
      counterpartyCurrency: toWallet.currency,
      exchangeRate: effectiveRate,
      notes:
        dto.notes ||
        `Transfer ${amountTransferred} ${fromWallet.currency} to ${toWallet.name || toWallet.id}`,
      createdAt: new Date(),
    });

    const txIn = new Transaction({
      id: `tx-in-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      walletId: toWallet.id,
      type: txTypeIn,
      amount: receivedAmount,
      currency: toWallet.currency,
      balanceAfter: newToBalance,
      referenceId,
      counterpartyWalletId: fromWallet.id,
      counterpartyCurrency: fromWallet.currency,
      exchangeRate: effectiveRate,
      notes:
        dto.notes ||
        `Received ${receivedAmount} ${toWallet.currency} from ${fromWallet.name || fromWallet.id}`,
      createdAt: new Date(),
    });

    // 5. Persist balance changes and transactions
    await this.walletRepo.updateBalance(fromWallet.id, newFromBalance);
    await this.walletRepo.updateBalance(toWallet.id, newToBalance);
    await this.transactionRepo.saveMany([txOut, txIn]);

    return {
      referenceId,
      fromWallet,
      toWallet,
      amountTransferred,
      effectiveRate,
      receivedAmount,
      transactions: [txOut, txIn],
    };
  }
}
