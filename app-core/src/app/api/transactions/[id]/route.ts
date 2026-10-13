import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/container';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tx = await container.getTransactionDetailUseCase.execute(id);

    return apiSuccess({
      transaction: tx.toJSON(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
