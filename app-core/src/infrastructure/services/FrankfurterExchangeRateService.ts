import {
  ExchangeRateResult,
  IExchangeRateService,
} from '@/core/domain/services/IExchangeRateService';

interface CachedRate {
  rate: number;
  expiresAt: number;
  timestamp: Date;
}

// Calibrated reference matrix relative to 1 USD
export const STATIC_USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  SGD: 1.35,
  IDR: 15850.0,
  JPY: 155.2,
};

export class FrankfurterExchangeRateService implements IExchangeRateService {
  private cache: Map<string, CachedRate> = new Map();
  private readonly ttlMs: number;
  private readonly timeoutMs: number;

  constructor(options?: { ttlSeconds?: number; timeoutMs?: number }) {
    this.ttlMs = (options?.ttlSeconds ?? 60) * 1000;
    this.timeoutMs = options?.timeoutMs ?? 3000;
  }

  async getRate(base: string, quote: string): Promise<ExchangeRateResult> {
    const baseNorm = base.toUpperCase();
    const quoteNorm = quote.toUpperCase();

    // 1. Identity case (same currency)
    if (baseNorm === quoteNorm) {
      return {
        base: baseNorm,
        quote: quoteNorm,
        rate: 1.0,
        timestamp: new Date(),
        cached: false,
        provider: 'frankfurter',
      };
    }

    const cacheKey = `${baseNorm}_${quoteNorm}`;
    const now = Date.now();

    // 2. Check in-memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return {
        base: baseNorm,
        quote: quoteNorm,
        rate: cached.rate,
        timestamp: cached.timestamp,
        cached: true,
        provider: 'frankfurter',
      };
    }

    // 3. Attempt external HTTP fetch from Frankfurter API
    try {
      const rate = await this.fetchLiveRate(baseNorm, quoteNorm);
      const timestamp = new Date();

      this.cache.set(cacheKey, {
        rate,
        expiresAt: now + this.ttlMs,
        timestamp,
      });

      return {
        base: baseNorm,
        quote: quoteNorm,
        rate,
        timestamp,
        cached: false,
        provider: 'frankfurter',
      };
    } catch {
      // 4. Graceful Fallback Matrix (Offline / Resilience Guard)
      // ---------------------------------------------------------------------------
      // RESILIENCE PATTERN: CIRCUIT DEGRADATION & TRIANGULAR CROSS-RATE FALLBACK
      // ---------------------------------------------------------------------------
      // Public foreign exchange APIs are prone to rate limiting, network latency, 
      // or upstream downtime. To guarantee High Availability (HA) for wallet evaluation:
      // 1. 60-second in-memory cache shields against redundant external HTTP requests.
      // 2. 3-second hard timeout aborts stale requests.
      // 3. Triangular Arbitrage Matrix (Base -> USD -> Quote) acts as graceful fallback,
      //    ensuring wallet conversion invariant never breaks during network dropouts.
      // ---------------------------------------------------------------------------
      const fallbackRate = this.calculateFallbackRate(baseNorm, quoteNorm);
      const timestamp = new Date();

      return {
        base: baseNorm,
        quote: quoteNorm,
        rate: fallbackRate,
        timestamp,
        cached: false,
        provider: 'fallback_matrix',
      };
    }
  }

  private async fetchLiveRate(base: string, quote: string): Promise<number> {
    // Primary endpoint: v2 direct rate
    try {
      const v2Url = `https://api.frankfurter.dev/v2/rate/${base.toLowerCase()}/${quote.toLowerCase()}`;
      const res = await fetch(v2Url, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof data.rate === 'number') {
          return data.rate;
        }
      }
    } catch {
      // Ignore and attempt legacy fallback endpoint
    }

    // Fallback endpoint: v1 latest
    const v1Url = `https://api.frankfurter.app/latest?from=${base}&to=${quote}`;
    const res = await fetch(v1Url, {
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`Frankfurter API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const rate = data?.rates?.[quote];
    if (typeof rate !== 'number') {
      throw new Error(`Rate not found in response for ${quote}`);
    }

    return rate;
  }

  public calculateFallbackRate(base: string, quote: string): number {
    const usdToBase = STATIC_USD_RATES[base] ?? 1.0;
    const usdToQuote = STATIC_USD_RATES[quote] ?? 1.0;

    // Triangular arbitrage conversion with 8-decimal micro-rate protection
    const rate = usdToQuote / usdToBase;
    return Math.round((rate + Number.EPSILON) * 100000000) / 100000000;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
