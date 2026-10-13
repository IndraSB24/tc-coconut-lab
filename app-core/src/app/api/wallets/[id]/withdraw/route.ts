import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/container';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const result = await container.withdrawFundsUseCase.execute({
      walletId: id,
      amount: Number(body.amount),
      notes: body.notes,
    });

    return apiSuccess({
      wallet: result.wallet.toJSON(),
      transaction: result.transaction.toJSON(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
