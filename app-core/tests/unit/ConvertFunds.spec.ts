import { describe, it, expect, beforeEach } from 'vitest';
import { ConvertFundsUseCase } from '@/core/use-cases/ConvertFundsUseCase';
import { InMemoryWalletRepository } from '@/infrastructure/repositories/InMemoryWalletRepository';
import { InMemoryTransactionRepository } from '@/infrastructure/repositories/InMemoryTransactionRepository';
import { IExchangeRateService, ExchangeRateResult } from '@/core/domain/services/IExchangeRateService';
import { Wallet } from '@/core/domain/entities/Wallet';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  SelfTransferError,
  WalletNotFoundError,
  SameCurrencyConversionError,
} from '@/core/domain/errors';

class MockExchangeRateService implements IExchangeRateService {
  constructor(private mockRates: Record<string, number> = {}) {}

  async getRate(base: string, quote: string): Promise<ExchangeRateResult> {
    const key = `${base.toUpperCase()}_${quote.toUpperCase()}`;
    const rate = this.mockRates[key] ?? 1.0;
    return {
      base,
      quote,
      rate,
      timestamp: new Date(),
      cached: false,
      provider: 'frankfurter',
    };
  }
}

describe('ConvertFundsUseCase', () => {
  let walletRepo: InMemoryWalletRepository;
  let txRepo: InMemoryTransactionRepository;
  let rateService: MockExchangeRateService;
  let useCase: ConvertFundsUseCase;

  beforeEach(() => {
    walletRepo = new InMemoryWalletRepository([
      new Wallet({
        id: 'wallet-usd',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 500.0,
      }),
      new Wallet({
        id: 'wallet-eur',
        userId: 'user-simulated',
        currency: 'EUR',
        balance: 100.0,
      }),
      new Wallet({
        id: 'wallet-idr',
        userId: 'user-simulated',
        currency: 'IDR',
        balance: 10000000.0,
      }),
    ]);
    txRepo = new InMemoryTransactionRepository();
    rateService = new MockExchangeRateService({
      USD_EUR: 0.92,
      USD_IDR: 15500.0,
    });
    useCase = new ConvertFundsUseCase(walletRepo, txRepo, rateService);
  });

  it('should atomically convert USD to EUR at rate 0.92 and log double-entry transactions', async () => {
    const result = await useCase.execute({
      fromWalletId: 'wallet-usd',
      toWalletId: 'wallet-eur',
      amount: 100.0,
      notes: 'Vacation currency exchange',
    });

    expect(result.rate).toBe(0.92);
    expect(result.sourceDebit.amountDebited).toBe(100.0);
    expect(result.sourceDebit.newBalance).toBe(400.0);
    expect(result.targetCredit.amountCredited).toBe(92.0);
    expect(result.targetCredit.newBalance).toBe(192.0);

    // Verify paired transactions share referenceId
    const [txOut, txIn] = result.transactions;
    expect(txOut.referenceId).toBe(result.referenceId);
    expect(txIn.referenceId).toBe(result.referenceId);
    expect(txOut.type).toBe('CONVERT_OUT');
    expect(txIn.type).toBe('CONVERT_IN');
    expect(txOut.counterpartyWalletId).toBe('wallet-eur');
    expect(txIn.counterpartyWalletId).toBe('wallet-usd');

    // Verify stored wallet balances
    const usdWallet = await walletRepo.findById('wallet-usd');
    const eurWallet = await walletRepo.findById('wallet-eur');
    expect(usdWallet?.balance).toBe(400.0);
    expect(eurWallet?.balance).toBe(192.0);

    // Verify transactions in repository
    const storedTxs = await txRepo.findAll();
    expect(storedTxs).toHaveLength(2);
  });

  it('should round IDR converted amount to 0 decimals', async () => {
    const result = await useCase.execute({
      fromWalletId: 'wallet-usd',
      toWalletId: 'wallet-idr',
      amount: 10.5, // 10.5 * 15500 = 162750 IDR -> rounds to whole rupiah
    });

    expect(result.targetCredit.amountCredited).toBe(162750);
    expect(result.targetCredit.newBalance).toBe(10162750);
  });

  it('should reject conversion if fromWallet and toWallet are identical (SelfTransferError)', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd',
        toWalletId: 'wallet-usd',
        amount: 50.0,
      })
    ).rejects.toThrow(SelfTransferError);
  });

  it('should reject conversion if balance is insufficient', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd',
        toWalletId: 'wallet-eur',
        amount: 600.0, // balance is 500
      })
    ).rejects.toThrow(InsufficientBalanceError);

    // Ensure balances did not change
    const usdWallet = await walletRepo.findById('wallet-usd');
    expect(usdWallet?.balance).toBe(500.0);
  });

  it('should reject non-positive amounts with InvalidAmountError', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd',
        toWalletId: 'wallet-eur',
        amount: 0,
      })
    ).rejects.toThrow(InvalidAmountError);
  });

  it('should reject non-existent wallet with WalletNotFoundError', async () => {
    await expect(
      useCase.execute({
        fromWalletId: 'wallet-fake',
        toWalletId: 'wallet-eur',
        amount: 10,
      })
    ).rejects.toThrow(WalletNotFoundError);
  });

  it('should reject conversion if both wallets have the same currency (SameCurrencyConversionError)', async () => {
    await walletRepo.save(
      new Wallet({
        id: 'wallet-usd-2',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 200.0,
      })
    );

    await expect(
      useCase.execute({
        fromWalletId: 'wallet-usd',
        toWalletId: 'wallet-usd-2',
        amount: 50.0,
      })
    ).rejects.toThrow(SameCurrencyConversionError);
  });
});
