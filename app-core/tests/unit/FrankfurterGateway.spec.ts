import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FrankfurterExchangeRateService } from '@/infrastructure/services/FrankfurterExchangeRateService';

describe('FrankfurterExchangeRateService', () => {
  let service: FrankfurterExchangeRateService;

  beforeEach(() => {
    service = new FrankfurterExchangeRateService({ ttlSeconds: 60, timeoutMs: 1000 });
    service.clearCache();
  });

  it('should return rate 1.0 immediately for identical base and quote currencies', async () => {
    const result = await service.getRate('USD', 'USD');
    expect(result.rate).toBe(1.0);
    expect(result.cached).toBe(false);
  });

  it('should compute fallback matrix rate when external API is offline', async () => {
    // When external fetch fails (mocked or offline)
    const fallbackRate = service.calculateFallbackRate('USD', 'EUR');
    expect(fallbackRate).toBe(0.92);

    const idrRate = service.calculateFallbackRate('USD', 'IDR');
    expect(idrRate).toBe(15850.0);

    // Cross-currency triangular arbitrage (EUR to GBP: 0.79 / 0.92 = ~0.8587)
    const crossRate = service.calculateFallbackRate('EUR', 'GBP');
    expect(crossRate).toBeCloseTo(0.8587, 3);

    // Micro-rate protection (IDR to EUR and IDR to GBP must NOT underflow to 0)
    const idrToEurRate = service.calculateFallbackRate('IDR', 'EUR');
    expect(idrToEurRate).toBeGreaterThan(0.00001);
    expect(idrToEurRate).toBeCloseTo(0.000058, 5);

    const idrToGbpRate = service.calculateFallbackRate('IDR', 'GBP');
    expect(idrToGbpRate).toBeGreaterThan(0.00001);
    expect(idrToGbpRate).toBeCloseTo(0.0000498, 5);
  });

  it('should cache fetched rates and serve cached result on second call', async () => {
    // Mock global fetch to return a test rate
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rate: 0.925 }),
    } as Response);

    const firstResult = await service.getRate('USD', 'EUR');
    expect(firstResult.rate).toBe(0.925);
    expect(firstResult.cached).toBe(false);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call should hit in-memory cache without calling fetch
    const secondResult = await service.getRate('USD', 'EUR');
    expect(secondResult.rate).toBe(0.925);
    expect(secondResult.cached).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1); // not called again

    fetchSpy.mockRestore();
  });

  it('should gracefully return fallback rate if fetch throws network error', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network Offline'));

    const result = await service.getRate('USD', 'SGD');
    expect(result.provider).toBe('fallback_matrix');
    expect(result.rate).toBe(1.35);

    fetchSpy.mockRestore();
  });
});
