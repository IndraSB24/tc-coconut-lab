import { describe, it, expect, beforeEach } from 'vitest';
import { CreateWalletUseCase } from '@/core/use-cases/CreateWalletUseCase';
import { InMemoryWalletRepository } from '@/infrastructure/repositories/InMemoryWalletRepository';
import { Wallet } from '@/core/domain/entities/Wallet';
import {
  ConflictError,
  UnsupportedCurrencyError,
  ValidationError,
} from '@/core/domain/errors';

describe('CreateWalletUseCase', () => {
  let walletRepo: InMemoryWalletRepository;
  let useCase: CreateWalletUseCase;

  beforeEach(() => {
    walletRepo = new InMemoryWalletRepository([
      new Wallet({
        id: 'wallet-usd-main',
        userId: 'user-simulated',
        currency: 'USD',
        name: 'USD Main',
        balance: 1000.0,
      }),
      new Wallet({
        id: 'wallet-idr-main',
        userId: 'user-simulated',
        currency: 'IDR',
        name: 'IDR Main',
        balance: 15000000.0,
      }),
    ]);
    useCase = new CreateWalletUseCase(walletRepo);
  });

  it('should successfully create a new secondary wallet in the same currency with a distinct name', async () => {
    const result = await useCase.execute({
      userId: 'user-simulated',
      currency: 'USD',
      name: 'USD Vacation Savings',
    });

    expect(result.wallet).toBeDefined();
    expect(result.wallet.currency).toBe('USD');
    expect(result.wallet.name).toBe('USD Vacation Savings');
    expect(result.wallet.balance).toBe(0.0);
    expect(result.wallet.formattedBalance).toBe('$0.00');

    const persisted = await walletRepo.findById(result.wallet.id);
    expect(persisted).not.toBeNull();
    expect(persisted?.name).toBe('USD Vacation Savings');
  });

  it('should reject wallet creation if a pocket with the same name and currency already exists', async () => {
    await expect(
      useCase.execute({
        userId: 'user-simulated',
        currency: 'USD',
        name: 'USD Main',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should reject wallet creation with an unsupported currency', async () => {
    await expect(
      useCase.execute({
        userId: 'user-simulated',
        currency: 'BTC',
        name: 'Bitcoin Vault',
      })
    ).rejects.toThrow(UnsupportedCurrencyError);
  });

  it('should reject wallet creation if userId is empty', async () => {
    await expect(
      useCase.execute({
        userId: '',
        currency: 'USD',
        name: 'USD Pocket',
      })
    ).rejects.toThrow(ValidationError);
  });
});
