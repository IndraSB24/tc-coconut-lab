import { describe, it, expect, beforeEach } from 'vitest';
import { GetTransactionHistoryUseCase } from '@/core/use-cases/GetTransactionHistoryUseCase';
import { GetTransactionDetailUseCase } from '@/core/use-cases/GetTransactionDetailUseCase';
import { InMemoryTransactionRepository } from '@/infrastructure/repositories/InMemoryTransactionRepository';
import { Transaction } from '@/core/domain/entities/Transaction';
import { NotFoundError } from '@/core/domain/errors';

describe('Transaction Query Use Cases', () => {
  let txRepo: InMemoryTransactionRepository;
  let historyUseCase: GetTransactionHistoryUseCase;
  let detailUseCase: GetTransactionDetailUseCase;

  beforeEach(() => {
    txRepo = new InMemoryTransactionRepository([
      new Transaction({
        id: 'tx-1',
        walletId: 'wallet-usd',
        type: 'DEPOSIT',
        amount: 500,
        currency: 'USD',
        balanceAfter: 500,
        referenceId: 'ref-1',
        createdAt: new Date('2026-10-13T10:00:00Z'),
      }),
      new Transaction({
        id: 'tx-2',
        walletId: 'wallet-usd',
        type: 'CONVERT_OUT',
        amount: 100,
        currency: 'USD',
        balanceAfter: 400,
        referenceId: 'ref-2',
        counterpartyWalletId: 'wallet-eur',
        counterpartyCurrency: 'EUR',
        exchangeRate: 0.92,
        createdAt: new Date('2026-10-13T11:00:00Z'),
      }),
      new Transaction({
        id: 'tx-3',
        walletId: 'wallet-eur',
        type: 'CONVERT_IN',
        amount: 92,
        currency: 'EUR',
        balanceAfter: 192,
        referenceId: 'ref-2',
        counterpartyWalletId: 'wallet-usd',
        counterpartyCurrency: 'USD',
        exchangeRate: 0.92,
        createdAt: new Date('2026-10-13T11:00:00Z'),
      }),
    ]);
    historyUseCase = new GetTransactionHistoryUseCase(txRepo);
    detailUseCase = new GetTransactionDetailUseCase(txRepo);
  });

  it('should list all transactions', async () => {
    const result = await historyUseCase.execute();
    expect(result.total).toBe(3);
    expect(result.transactions).toHaveLength(3);
  });

  it('should filter transactions by walletId', async () => {
    const result = await historyUseCase.execute({ walletId: 'wallet-eur' });
    expect(result.total).toBe(1);
    expect(result.transactions[0].id).toBe('tx-3');
  });

  it('should filter transactions by type', async () => {
    const result = await historyUseCase.execute({ type: 'DEPOSIT' });
    expect(result.total).toBe(1);
    expect(result.transactions[0].id).toBe('tx-1');
  });

  it('should get detail of individual transaction by id', async () => {
    const tx = await detailUseCase.execute('tx-2');
    expect(tx.id).toBe('tx-2');
    expect(tx.counterpartyWalletId).toBe('wallet-eur');
    expect(tx.exchangeRate).toBe(0.92);
  });

  it('should throw NotFoundError if transaction id does not exist', async () => {
    await expect(detailUseCase.execute('tx-999')).rejects.toThrow(NotFoundError);
  });
});
