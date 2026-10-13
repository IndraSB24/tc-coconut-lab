import { NextRequest } from 'next/server';
import { container } from '@/infrastructure/container';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const base = searchParams.get('base') || 'USD';
    const quote = searchParams.get('quote') || 'EUR';

    const result = await container.exchangeRateService.getRate(base, quote);

    return apiSuccess({
      base: result.base,
      quote: result.quote,
      rate: result.rate,
      cached: result.cached,
      provider: result.provider,
      timestamp: result.timestamp.toISOString(),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
