import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/container';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { roundCurrency } from '@/core/domain/utils/currency-math';

export async function GET() {
  try {
    const userId = 'user-simulated';
    const [user, result] = await Promise.all([
      container.userRepo.findById(userId),
      container.getWalletsUseCase.execute(userId),
    ]);

    // Calculate aggregated estimated USD portfolio value
    let totalUsd = 0;
    for (const w of result.wallets) {
      if (w.currency === 'USD') {
        totalUsd += w.balance;
      } else {
        const rateResult = await container.exchangeRateService.getRate(w.currency, 'USD');
        totalUsd += w.balance * rateResult.rate;
      }
    }

    return apiSuccess({
      userId,
      user: user ? user.toJSON() : null,
      totalPortfolioEstimatedUsd: roundCurrency(totalUsd, 'USD'),
      wallets: result.wallets.map((w) => w.toJSON()),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = 'user-simulated';
    const body = await req.json();

    const result = await container.createWalletUseCase.execute({
      userId,
      currency: String(body.currency || ''),
      name: body.name ? String(body.name) : undefined,
    });

    return apiSuccess(
      {
        wallet: result.wallet.toJSON(),
      },
      undefined,
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
