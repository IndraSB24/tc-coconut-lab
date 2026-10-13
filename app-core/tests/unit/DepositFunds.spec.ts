import { describe, it, expect, beforeEach } from 'vitest';
import { DepositFundsUseCase } from '@/core/use-cases/DepositFundsUseCase';
import { InMemoryWalletRepository } from '@/infrastructure/repositories/InMemoryWalletRepository';
import { InMemoryTransactionRepository } from '@/infrastructure/repositories/InMemoryTransactionRepository';
import { Wallet } from '@/core/domain/entities/Wallet';
import { InvalidAmountError, WalletNotFoundError } from '@/core/domain/errors';

describe('DepositFundsUseCase', () => {
  let walletRepo: InMemoryWalletRepository;
  let txRepo: InMemoryTransactionRepository;
  let useCase: DepositFundsUseCase;

  beforeEach(async () => {
    walletRepo = new InMemoryWalletRepository([
      new Wallet({
        id: 'wallet-usd',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 100.0,
      }),
    ]);
    txRepo = new InMemoryTransactionRepository();
    useCase = new DepositFundsUseCase(walletRepo, txRepo);
  });

  it('should successfully deposit funds and record transaction in ledger', async () => {
    const result = await useCase.execute({
      walletId: 'wallet-usd',
      amount: 50.0,
      notes: 'Test top-up',
    });

    expect(result.wallet.balance).toBe(150.0);
    expect(result.transaction.type).toBe('DEPOSIT');
    expect(result.transaction.amount).toBe(50.0);
    expect(result.transaction.balanceAfter).toBe(150.0);
    expect(result.transaction.notes).toBe('Test top-up');

    // Verify persistence in repository
    const storedWallet = await walletRepo.findById('wallet-usd');
    expect(storedWallet?.balance).toBe(150.0);

    const storedTxs = await txRepo.findByWalletId('wallet-usd');
    expect(storedTxs).toHaveLength(1);
    expect(storedTxs[0].id).toBe(result.transaction.id);
  });

  it('should reject deposit if wallet does not exist', async () => {
    await expect(
      useCase.execute({
        walletId: 'non-existent-wallet',
        amount: 100.0,
      })
    ).rejects.toThrow(WalletNotFoundError);
  });

  it('should reject non-positive amounts', async () => {
    await expect(
      useCase.execute({
        walletId: 'wallet-usd',
        amount: 0,
      })
    ).rejects.toThrow(InvalidAmountError);

    await expect(
      useCase.execute({
        walletId: 'wallet-usd',
        amount: -50,
      })
    ).rejects.toThrow(InvalidAmountError);
  });
});
