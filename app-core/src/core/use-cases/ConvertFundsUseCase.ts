import { IWalletRepository } from '../domain/repositories/IWalletRepository';
import { ITransactionRepository } from '../domain/repositories/ITransactionRepository';
import { IExchangeRateService } from '../domain/services/IExchangeRateService';
import { Transaction } from '../domain/entities/Transaction';
import {
  InvalidAmountError,
  SelfTransferError,
  WalletNotFoundError,
  SameCurrencyConversionError,
} from '../domain/errors';
import { roundCurrency } from '../domain/utils/currency-math';

export interface ConvertFundsDTO {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  notes?: string;
  referenceId?: string;
}

export interface ConvertFundsResult {
  referenceId: string;
  rate: number;
  provider: string;
  sourceDebit: {
    walletId: string;
    currency: string;
    amountDebited: number;
    newBalance: number;
  };
  targetCredit: {
    walletId: string;
    currency: string;
    amountCredited: number;
    newBalance: number;
  };
  transactions: [Transaction, Transaction];
}

export class ConvertFundsUseCase {
  constructor(
    private walletRepo: IWalletRepository,
    private transactionRepo: ITransactionRepository,
    private exchangeRateService: IExchangeRateService
  ) {}

  async execute(dto: ConvertFundsDTO): Promise<ConvertFundsResult> {
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

    // Invariant: Currency conversion strictly requires different currencies
    if (fromWallet.currency === toWallet.currency) {
      throw new SameCurrencyConversionError(fromWallet.currency);
    }

    // 1. Fetch live or cached exchange rate
    const rateResult = await this.exchangeRateService.getRate(
      fromWallet.currency,
      toWallet.currency
    );
    const rate = rateResult.rate;

    // 2. Compute debit and credit amounts with currency precision
    const debitedAmount = roundCurrency(dto.amount, fromWallet.currency);
    const creditedAmount = roundCurrency(debitedAmount * rate, toWallet.currency);

    // 3. Entity withdrawal and deposit (enforces non-negative balance)
    const newFromBalance = fromWallet.withdraw(debitedAmount);
    const newToBalance = toWallet.deposit(creditedAmount);

    // 4. Generate shared correlation referenceId
    const referenceId =
      dto.referenceId || `conv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // 5. Create paired double-entry ledger transactions
    const txOut = new Transaction({
      id: `tx-out-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      walletId: fromWallet.id,
      type: 'CONVERT_OUT',
      amount: debitedAmount,
      currency: fromWallet.currency,
      balanceAfter: newFromBalance,
      referenceId,
      counterpartyWalletId: toWallet.id,
      counterpartyCurrency: toWallet.currency,
      exchangeRate: rate,
      notes:
        dto.notes ||
        `Converted ${debitedAmount} ${fromWallet.currency} to ${creditedAmount} ${toWallet.currency} @ rate ${rate}`,
      createdAt: new Date(),
    });

    const txIn = new Transaction({
      id: `tx-in-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      walletId: toWallet.id,
      type: 'CONVERT_IN',
      amount: creditedAmount,
      currency: toWallet.currency,
      balanceAfter: newToBalance,
      referenceId,
      counterpartyWalletId: fromWallet.id,
      counterpartyCurrency: fromWallet.currency,
      exchangeRate: rate,
      notes:
        dto.notes ||
        `Received ${creditedAmount} ${toWallet.currency} from ${debitedAmount} ${fromWallet.currency} @ rate ${rate}`,
      createdAt: new Date(),
    });

    // 6. Persist balance changes and transactions
    // ---------------------------------------------------------------------------
    // ARCHITECTURAL DESIGN NOTE: TRANSACTION BOUNDARY & TESTABILITY TRADE-OFF
    // ---------------------------------------------------------------------------
    // In pure Domain-Driven Design (Hexagonal Architecture), Use Cases orchestrate
    // abstract repository interfaces (ports) without coupling to ORM-specific 
    // transaction constructs (e.g. Prisma.TransactionClient). This allows 100% 
    // in-memory test execution in <300ms without DB dependency.
    // 
    // PRODUCTION EVOLUTION:
    // In high-concurrency production, these operations would be wrapped using a 
    // Unit of Work pattern or an ambient transactional decorator/context passing 
    // an ACID transaction across repositories, alongside Optimistic Locking 
    // (e.g., version column check) to prevent concurrent write race conditions.
    // ---------------------------------------------------------------------------
    await this.walletRepo.updateBalance(fromWallet.id, newFromBalance);
    await this.walletRepo.updateBalance(toWallet.id, newToBalance);
    await this.transactionRepo.saveMany([txOut, txIn]);

    return {
      referenceId,
      rate,
      provider: rateResult.provider,
      sourceDebit: {
        walletId: fromWallet.id,
        currency: fromWallet.currency,
        amountDebited: debitedAmount,
        newBalance: newFromBalance,
      },
      targetCredit: {
        walletId: toWallet.id,
        currency: toWallet.currency,
        amountCredited: creditedAmount,
        newBalance: newToBalance,
      },
      transactions: [txOut, txIn],
    };
  }
}
