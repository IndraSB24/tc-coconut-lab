import { describe, it, expect, beforeEach } from 'vitest';
import { TransferFundsUseCase } from '@/core/use-cases/TransferFundsUseCase';
import { InMemoryWalletRepository } from '@/infrastructure/repositories/InMemoryWalletRepository';
import { InMemoryTransactionRepository } from '@/infrastructure/repositories/InMemoryTransactionRepository';
import { IExchangeRateService, ExchangeRateResult } from '@/core/domain/services/IExchangeRateService';
import { Wallet } from '@/core/domain/entities/Wallet';
import {
  CurrencyMismatchTransferError,
  InsufficientBalanceError,
  InvalidAmountError,
  SelfTransferError,
} from '@/core/domain/errors';

class MockExchangeRateService implements IExchangeRateService {
  async getRate(base: string, quote: string): Promise<ExchangeRateResult> {
    const rates: Record<string, number> = {
      USD_SGD: 1.35,
    };
    const key = `${base.toUpperCase()}_${quote.toUpperCase()}`;
    return {
      base,
      quote,
      rate: rates[key] ?? 1.0,
      timestamp: new Date(),
      cached: false,
      provider: 'frankfurter',
    };
  }
}

describe('TransferFundsUseCase', () => {
  let walletRepo: InMemoryWalletRepository;
  let txRepo: InMemoryTransactionRepository;
  let rateService: MockExchangeRateService;
  let useCase: TransferFundsUseCase;

  beforeEach(() => {
    walletRepo = new InMemoryWalletRepository([
      new Wallet({
        id: 'wallet-usd-primary',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 1000.0,
      }),
      new Wallet({
        id: 'wallet-usd-savings',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 200.0,
      }),
      new Wallet({
        id: 'wallet-sgd',
        userId: 'user-simulated',
        currency: 'SGD',
        balance: 50.0,
      }),
    ]);
    txRepo = new InMemoryTransactionRepository();
    rateService = new MockExchangeRateService();
    useCase = new TransferFundsUseCase(walletRepo, txRepo, rateService);
  });

  it('should transfer funds 1:1 between same-currency wallets with TRANSFER_OUT and TRANSFER_IN records', async () => {
    const result = await useCase.execute({
      fromWalletId: 'wallet-usd-primary',
      toWalletId: 'wallet-usd-savings',
      amount: 150.0,
    });

    expect(result.amountTransferred).toBe(150.0);
    expect(result.receivedAmount).toBe(150.0);
    expect(result.effectiveRate).toBe(1.0);
    expect(result.fromWallet.balance).toBe(850.0);
    expect(result.toWallet.balance).toBe(350.0);

    const [txOut, txIn] = result.transactions;
    expect(txOut.type).toBe('TRANSFER_OUT');
    expect(txIn.type).toBe('TRANSFER_IN');
    expect(txOut.referenceId).toBe(result.referenceId);
    expect(txIn.referenceId).toBe(result.referenceId);
  });

  it('should reject cross-currency transfers with CurrencyMismatchTransferError', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd-primary',
        toWalletId: 'wallet-sgd',
        amount: 100.0,
      })
    ).rejects.toThrow(CurrencyMismatchTransferError);
  });

  it('should reject transfer to self with SelfTransferError', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd-primary',
        toWalletId: 'wallet-usd-primary',
        amount: 50.0,
      })
    ).rejects.toThrow(SelfTransferError);
  });

  it('should reject transfer when balance is insufficient', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd-savings', // balance: 200
        toWalletId: 'wallet-usd-primary',
        amount: 250.0,
      })
    ).rejects.toThrow(InsufficientBalanceError);
  });

  it('should reject non-positive transfer amounts', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd-primary',
        toWalletId: 'wallet-usd-savings',
        amount: 0,
      })
    ).rejects.toThrow(InvalidAmountError);
  });
});
