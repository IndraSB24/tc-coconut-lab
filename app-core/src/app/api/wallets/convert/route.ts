import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/container';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await container.convertFundsUseCase.execute({
      fromWalletId: String(body.fromWalletId),
      toWalletId: String(body.toWalletId),
      amount: Number(body.amount),
      notes: body.notes,
    });

    return apiSuccess({
      referenceId: result.referenceId,
      rate: result.rate,
      provider: result.provider,
      sourceDebit: result.sourceDebit,
      targetCredit: result.targetCredit,
      transactions: result.transactions.map((t) => t.toJSON()),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
