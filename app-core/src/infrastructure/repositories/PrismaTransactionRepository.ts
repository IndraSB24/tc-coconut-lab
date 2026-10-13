import { prisma } from '@/lib/prisma';
import { Transaction, TransactionType } from '@/core/domain/entities/Transaction';
import { ITransactionRepository } from '@/core/domain/repositories/ITransactionRepository';

export class PrismaTransactionRepository implements ITransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    await prisma.transaction.create({
      data: {
        id: transaction.id,
        walletId: transaction.walletId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
        balanceAfter: transaction.balanceAfter,
        referenceId: transaction.referenceId,
        counterpartyWalletId: transaction.counterpartyWalletId,
        counterpartyCurrency: transaction.counterpartyCurrency,
        exchangeRate: transaction.exchangeRate,
        notes: transaction.notes,
        createdAt: transaction.createdAt,
      },
    });
  }

  async saveMany(transactions: Transaction[]): Promise<void> {
    await prisma.transaction.createMany({
      data: transactions.map((t) => ({
        id: t.id,
        walletId: t.walletId,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        balanceAfter: t.balanceAfter,
        referenceId: t.referenceId,
        counterpartyWalletId: t.counterpartyWalletId,
        counterpartyCurrency: t.counterpartyCurrency,
        exchangeRate: t.exchangeRate,
        notes: t.notes,
        createdAt: t.createdAt,
      })),
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const raw = await prisma.transaction.findUnique({
      where: { id },
    });
    if (!raw) return null;

    return new Transaction({
      id: raw.id,
      walletId: raw.walletId,
      type: raw.type as TransactionType,
      amount: raw.amount,
      currency: raw.currency,
      balanceAfter: raw.balanceAfter,
      referenceId: raw.referenceId,
      counterpartyWalletId: raw.counterpartyWalletId,
      counterpartyCurrency: raw.counterpartyCurrency,
      exchangeRate: raw.exchangeRate,
      notes: raw.notes,
      createdAt: raw.createdAt,
    });
  }

  async findByWalletId(walletId: string, limit = 50): Promise<Transaction[]> {
    const records = await prisma.transaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map(
      (raw) =>
        new Transaction({
          id: raw.id,
          walletId: raw.walletId,
          type: raw.type as TransactionType,
          amount: raw.amount,
          currency: raw.currency,
          balanceAfter: raw.balanceAfter,
          referenceId: raw.referenceId,
          counterpartyWalletId: raw.counterpartyWalletId,
          counterpartyCurrency: raw.counterpartyCurrency,
          exchangeRate: raw.exchangeRate,
          notes: raw.notes,
          createdAt: raw.createdAt,
        })
    );
  }

  async findAll(limit = 50): Promise<Transaction[]> {
    const records = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map(
      (raw) =>
        new Transaction({
          id: raw.id,
          walletId: raw.walletId,
          type: raw.type as TransactionType,
          amount: raw.amount,
          currency: raw.currency,
          balanceAfter: raw.balanceAfter,
          referenceId: raw.referenceId,
          counterpartyWalletId: raw.counterpartyWalletId,
          counterpartyCurrency: raw.counterpartyCurrency,
          exchangeRate: raw.exchangeRate,
          notes: raw.notes,
          createdAt: raw.createdAt,
        })
    );
  }
}
