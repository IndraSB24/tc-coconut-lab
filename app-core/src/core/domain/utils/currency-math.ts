export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'SGD', 'IDR'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(currency: string): currency is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase() as SupportedCurrency);
}

// ---------------------------------------------------------------------------
// FINANCIAL DOMAIN INVARIANT: SUBUNIT PRECISION & IEEE-754 EPSILON GUARD
// ---------------------------------------------------------------------------
// 1. ISO 4217 Currency Decimals: IDR (and JPY) has 0 minor units (whole rupiah), whereas USD/EUR/
//    GBP/SGD have 2 minor units (cents).
// 2. JavaScript floating-point arithmetic (IEEE-754) suffers from binary rounding
//    drift (e.g., 0.1 + 0.2 !== 0.3). We apply Number.EPSILON prior to rounding
//    to ensure deterministic boundary resolution.
// 3. For enterprise banking scale, this would be migrated to minor-unit integer 
//    arithmetic (cents/satoshis) or arbitrary-precision libraries (e.g., Decimal.js/BigInt).
// ---------------------------------------------------------------------------
export function getCurrencyDecimals(currency: string): number {
  const norm = currency.toUpperCase();
  return norm === 'IDR' || norm === 'JPY' ? 0 : 2;
}

export function roundCurrency(amount: number, currency: string): number {
  const precision = getCurrencyDecimals(currency);
  const factor = Math.pow(10, precision);
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}

export function formatCurrency(amount: number, currency: string): string {
  const decimals = getCurrencyDecimals(currency);
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    SGD: 'S$',
    IDR: 'Rp ',
    JPY: '¥',
  };
  const symbol = symbols[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}
