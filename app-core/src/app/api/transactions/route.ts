import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/container';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { TransactionType } from '@/core/domain/entities/Transaction';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get('walletId') || undefined;
    const type = (searchParams.get('type') as TransactionType) || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const result = await container.getTransactionHistoryUseCase.execute({
      walletId,
      type,
      limit,
    });

    return apiSuccess({
      total: result.total,
      transactions: result.transactions.map((t) => t.toJSON()),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
