import { prisma } from '@/lib/prisma';
import { Wallet, WalletStatus } from '@/core/domain/entities/Wallet';
import { IWalletRepository } from '@/core/domain/repositories/IWalletRepository';

export class PrismaWalletRepository implements IWalletRepository {
  async findById(id: string): Promise<Wallet | null> {
    const raw = await prisma.wallet.findUnique({
      where: { id },
    });
    if (!raw) return null;

    return new Wallet({
      id: raw.id,
      userId: raw.userId,
      currency: raw.currency,
      name: raw.name,
      balance: raw.balance,
      status: raw.status as WalletStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByUserId(userId: string): Promise<Wallet[]> {
    const records = await prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return records.map(
      (raw) =>
        new Wallet({
          id: raw.id,
          userId: raw.userId,
          currency: raw.currency,
          name: raw.name,
          balance: raw.balance,
          status: raw.status as WalletStatus,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        })
    );
  }

  async findByUserAndCurrency(userId: string, currency: string): Promise<Wallet | null> {
    const raw = await prisma.wallet.findFirst({
      where: {
        userId,
        currency: currency.toUpperCase(),
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!raw) return null;

    return new Wallet({
      id: raw.id,
      userId: raw.userId,
      currency: raw.currency,
      name: raw.name,
      balance: raw.balance,
      status: raw.status as WalletStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async save(wallet: Wallet): Promise<void> {
    await prisma.wallet.upsert({
      where: { id: wallet.id },
      update: {
        name: wallet.name,
        balance: wallet.balance,
        status: wallet.status,
        updatedAt: new Date(),
      },
      create: {
        id: wallet.id,
        userId: wallet.userId,
        currency: wallet.currency,
        name: wallet.name,
        balance: wallet.balance,
        status: wallet.status,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
      },
    });
  }

  async updateBalance(id: string, newBalance: number): Promise<void> {
    await prisma.wallet.update({
      where: { id },
      data: {
        balance: newBalance,
        updatedAt: new Date(),
      },
    });
  }
}
