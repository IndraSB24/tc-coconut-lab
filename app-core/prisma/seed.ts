import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  const userId = 'user-simulated';

  // Upsert simulated user
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      name: 'Indra SB',
      email: 'indra@coconut.io',
    },
    create: {
      id: userId,
      name: 'Indra SB',
      email: 'indra@coconut.io',
    },
  });

  const initialWallets = [
    { id: 'wallet-usd', currency: 'USD', name: 'USD Main', balance: 1000.0 },
    { id: 'wallet-eur', currency: 'EUR', name: 'EUR Main', balance: 500.0 },
    { id: 'wallet-gbp', currency: 'GBP', name: 'GBP Main', balance: 300.0 },
    { id: 'wallet-sgd', currency: 'SGD', name: 'SGD Main', balance: 400.0 },
    { id: 'wallet-idr', currency: 'IDR', name: 'IDR Main', balance: 15000000.0 },
  ];

  // Remove legacy JPY wallet if present to maintain strict 5-wallet constraint
  const legacyJpy = await prisma.wallet.findFirst({
    where: { userId, currency: 'JPY' },
  });
  if (legacyJpy) {
    await prisma.transaction.deleteMany({ where: { walletId: legacyJpy.id } });
    await prisma.wallet.delete({ where: { id: legacyJpy.id } });
  }

  for (const w of initialWallets) {
    const existingWallet = await prisma.wallet.findUnique({
      where: { id: w.id },
    });

    if (!existingWallet) {
      await prisma.wallet.create({
        data: {
          id: w.id,
          userId,
          currency: w.currency,
          name: w.name,
          balance: w.balance,
          status: 'ACTIVE',
          transactions: {
            create: {
              type: 'DEPOSIT',
              amount: w.balance,
              currency: w.currency,
              balanceAfter: w.balance,
              referenceId: `seed-init-${w.currency.toLowerCase()}`,
              notes: `Initial simulated fund allocation for ${w.currency}`,
            },
          },
        },
      });
    } else {
      await prisma.wallet.update({
        where: { id: w.id },
        data: {
          name: w.name,
          status: 'ACTIVE',
        },
      });
    }
  }

  console.log('✅ Database seeded successfully with user Indra SB (indra@coconut.io) & 5 multi-currency wallets.');
}

seedDatabase()
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
