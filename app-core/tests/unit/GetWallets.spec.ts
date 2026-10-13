import { describe, it, expect, beforeEach } from 'vitest';
import { GetWalletsUseCase } from '@/core/use-cases/GetWalletsUseCase';
import { InMemoryWalletRepository } from '@/infrastructure/repositories/InMemoryWalletRepository';
import { Wallet } from '@/core/domain/entities/Wallet';

describe('GetWalletsUseCase', () => {
  let walletRepo: InMemoryWalletRepository;
  let useCase: GetWalletsUseCase;

  beforeEach(() => {
    walletRepo = new InMemoryWalletRepository([
      new Wallet({
        id: 'wallet-usd',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 1000.0,
      }),
      new Wallet({
        id: 'wallet-eur',
        userId: 'user-simulated',
        currency: 'EUR',
        balance: 500.0,
      }),
      new Wallet({
        id: 'wallet-idr',
        userId: 'user-simulated',
        currency: 'IDR',
        balance: 15000000.0,
      }),
    ]);
    useCase = new GetWalletsUseCase(walletRepo);
  });

  it('should return all wallets and currency balance map for user', async () => {
    const result = await useCase.execute('user-simulated');

    expect(result.userId).toBe('user-simulated');
    expect(result.wallets).toHaveLength(3);
    expect(result.balances).toEqual({
      USD: 1000.0,
      EUR: 500.0,
      IDR: 15000000.0,
    });
  });

  it('should return empty list if user has no wallets', async () => {
    const result = await useCase.execute('user-other');

    expect(result.userId).toBe('user-other');
    expect(result.wallets).toHaveLength(0);
    expect(result.balances).toEqual({});
  });
});
