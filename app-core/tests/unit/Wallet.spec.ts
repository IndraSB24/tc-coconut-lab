import { describe, it, expect } from 'vitest';
import { Wallet } from '@/core/domain/entities/Wallet';
import {
  InsufficientBalanceError,
  InvalidAmountError,
  UnsupportedCurrencyError,
} from '@/core/domain/errors';

describe('Wallet Domain Entity', () => {
  it('should create an active USD wallet with 2 decimal precision', () => {
    const wallet = new Wallet({
      id: 'wallet-usd',
      userId: 'user-simulated',
      currency: 'USD',
      balance: 100.506,
    });

    expect(wallet.id).toBe('wallet-usd');
    expect(wallet.currency).toBe('USD');
    expect(wallet.balance).toBe(100.51); // rounded to 2 decimals
    expect(wallet.status).toBe('ACTIVE');
    expect(wallet.formattedBalance).toBe('$100.51');
  });

  it('should create an IDR wallet with 0 decimal precision', () => {
    const wallet = new Wallet({
      id: 'wallet-idr',
      userId: 'user-simulated',
      currency: 'IDR',
      balance: 50000.75,
    });

    expect(wallet.balance).toBe(50001); // rounded to whole rupiah
    expect(wallet.formattedBalance).toBe('Rp 50,001');
  });

  it('should throw UnsupportedCurrencyError on invalid currency', () => {
    expect(() => {
      new Wallet({
        id: 'wallet-bad',
        userId: 'user-1',
        currency: 'XYZ',
        balance: 10,
      });
    }).toThrow(UnsupportedCurrencyError);
  });

  it('should successfully deposit funds and round appropriately', () => {
    const wallet = new Wallet({
      id: 'wallet-eur',
      userId: 'user-simulated',
      currency: 'EUR',
      balance: 50.0,
    });

    const newBalance = wallet.deposit(25.555);
    expect(newBalance).toBe(75.56);
    expect(wallet.balance).toBe(75.56);
  });

  it('should reject non-positive deposit amounts', () => {
    const wallet = new Wallet({
      id: 'wallet-eur',
      userId: 'user-simulated',
      currency: 'EUR',
      balance: 50.0,
    });

    expect(() => wallet.deposit(0)).toThrow(InvalidAmountError);
    expect(() => wallet.deposit(-10)).toThrow(InvalidAmountError);
    expect(() => wallet.deposit(NaN)).toThrow(InvalidAmountError);
  });

  it('should successfully withdraw funds', () => {
    const wallet = new Wallet({
      id: 'wallet-sgd',
      userId: 'user-simulated',
      currency: 'SGD',
      balance: 100.0,
    });

    const newBalance = wallet.withdraw(40.25);
    expect(newBalance).toBe(59.75);
    expect(wallet.balance).toBe(59.75);
  });

  it('should reject withdrawal exceeding balance with InsufficientBalanceError', () => {
    const wallet = new Wallet({
      id: 'wallet-usd',
      userId: 'user-simulated',
      currency: 'USD',
      balance: 50.0,
    });

    expect(() => wallet.withdraw(50.01)).toThrow(InsufficientBalanceError);
    expect(wallet.balance).toBe(50.0); // balance untouched
  });

  it('should reject non-positive withdrawal amounts', () => {
    const wallet = new Wallet({
      id: 'wallet-usd',
      userId: 'user-simulated',
      currency: 'USD',
      balance: 50.0,
    });

    expect(() => wallet.withdraw(0)).toThrow(InvalidAmountError);
    expect(() => wallet.withdraw(-5)).toThrow(InvalidAmountError);
  });
});
