import { describe, it, expect, beforeEach } from 'vitest';
import { WithdrawFundsUseCase } from '@/core/use-cases/WithdrawFundsUseCase';
import { InMemoryWalletRepository } from '@/infrastructure/repositories/InMemoryWalletRepository';
import { InMemoryTransactionRepository } from '@/infrastructure/repositories/InMemoryTransactionRepository';
import { Wallet } from '@/core/domain/entities/Wallet';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  WalletNotFoundError,
} from '@/core/domain/errors';

describe('WithdrawFundsUseCase', () => {
  let walletRepo: InMemoryWalletRepository;
  let txRepo: InMemoryTransactionRepository;
  let useCase: WithdrawFundsUseCase;

  beforeEach(() => {
    walletRepo = new InMemoryWalletRepository([
      new Wallet({
        id: 'wallet-eur',
        userId: 'user-simulated',
        currency: 'EUR',
        balance: 200.0,
      }),
    ]);
    txRepo = new InMemoryTransactionRepository();
    useCase = new WithdrawFundsUseCase(walletRepo, txRepo);
  });

  it('should successfully withdraw funds and record transaction in ledger', async () => {
    const result = await useCase.execute({
      walletId: 'wallet-eur',
      amount: 75.0,
      notes: 'ATM cash-out simulation',
    });

    expect(result.wallet.balance).toBe(125.0);
    expect(result.transaction.type).toBe('WITHDRAWAL');
    expect(result.transaction.amount).toBe(75.0);
    expect(result.transaction.balanceAfter).toBe(125.0);
    expect(result.transaction.notes).toBe('ATM cash-out simulation');

    // Verify persistence
    const storedWallet = await walletRepo.findById('wallet-eur');
    expect(storedWallet?.balance).toBe(125.0);

    const storedTxs = await txRepo.findByWalletId('wallet-eur');
    expect(storedTxs).toHaveLength(1);
    expect(storedTxs[0].id).toBe(result.transaction.id);
  });

  it('should reject withdrawal exceeding balance with InsufficientBalanceError', async () => {
    await expect(
      useCase.execute({
        walletId: 'wallet-eur',
        amount: 250.0,
      })
    ).rejects.toThrow(InsufficientBalanceError);

    // Balance should remain unchanged
    const storedWallet = await walletRepo.findById('wallet-eur');
    expect(storedWallet?.balance).toBe(200.0);
  });

  it('should reject non-existent wallet with WalletNotFoundError', async () => {
    await expect(
      useCase.execute({
        walletId: 'unknown-wallet',
        amount: 50.0,
      })
    ).rejects.toThrow(WalletNotFoundError);
  });

  it('should reject non-positive amounts with InvalidAmountError', async () => {
    await expect(
      useCase.execute({
        walletId: 'wallet-eur',
        amount: 0,
      })
    ).rejects.toThrow(InvalidAmountError);

    await expect(
      useCase.execute({
        walletId: 'wallet-eur',
        amount: -20,
      })
    ).rejects.toThrow(InvalidAmountError);
  });
});
