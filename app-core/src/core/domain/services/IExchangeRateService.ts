export interface ExchangeRateResult {
  base: string;
  quote: string;
  rate: number;
  timestamp: Date;
  cached: boolean;
  provider: 'frankfurter' | 'fallback_matrix';
}

export interface IExchangeRateService {
  getRate(base: string, quote: string): Promise<ExchangeRateResult>;
}
