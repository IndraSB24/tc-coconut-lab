'use client';

import React from 'react';

export interface CurrencyAmountInputProps {
  value: string; // Raw numeric string without thousand commas (e.g. "15000000" or "1250.50")
  onChange: (rawValue: string) => void;
  currency: string;
  symbol?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

const DEFAULT_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  IDR: 'Rp',
  JPY: '¥',
};

/**
 * Formats a raw numeric string into a localized display string with thousand separators.
 * Preserves intentional trailing dots (e.g., "1,000.") and suppresses decimals for zero-decimal currencies (IDR, JPY).
 */
export function formatMaskedCurrency(raw: string, currency: string): string {
  if (!raw) return '';

  const isZeroDecimal = currency.toUpperCase() === 'IDR' || currency.toUpperCase() === 'JPY';

  // 1. Sanitize: allow only digits and single decimal dot (if permitted)
  let clean = raw.replace(/[^0-9.]/g, '');
  if (isZeroDecimal) {
    const dotIndex = clean.indexOf('.');
    clean = dotIndex !== -1 ? clean.slice(0, dotIndex) : clean;
    clean = clean.replace(/\D/g, '');
    const formattedInt = clean ? clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
    return formattedInt;
  }

  // 2. Normalize multiple decimal dots
  const dotIndex = clean.indexOf('.');
  if (dotIndex !== -1) {
    clean = clean.slice(0, dotIndex + 1) + clean.slice(dotIndex + 1).replace(/\./g, '');
  }

  // 3. Split integer and decimal portions
  const [intPart, decPart] = clean.split('.');

  // Format integer with comma thousand separators
  const formattedInt = intPart ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

  // Return formatted display
  if (decPart !== undefined) {
    return `${formattedInt}.${decPart.slice(0, 2)}`;
  }

  return formattedInt;
}

export function CurrencyAmountInput({
  value,
  onChange,
  currency,
  symbol,
  placeholder = '0',
  required = false,
  disabled = false,
  className = '',
  id,
  'aria-label': ariaLabel,
}: CurrencyAmountInputProps) {
  const isZeroDecimal = currency.toUpperCase() === 'IDR' || currency.toUpperCase() === 'JPY';
  const currencySymbol = symbol || DEFAULT_SYMBOLS[currency.toUpperCase()] || `${currency} `;

  // Display value dynamically formatted with thousand commas
  const displayValue = formatMaskedCurrency(value, currency);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    if (!inputVal) {
      onChange('');
      return;
    }

    // Strip thousand commas to obtain clean raw numeric string
    let raw = inputVal.replace(/,/g, '');

    if (isZeroDecimal) {
      // Disallow decimal point and truncate
      const dotIndex = raw.indexOf('.');
      const intOnly = dotIndex !== -1 ? raw.slice(0, dotIndex) : raw;
      raw = intOnly.replace(/\D/g, '');
    } else {
      // Allow digits and at most one decimal point
      raw = raw.replace(/[^0-9.]/g, '');
      const dotIndex = raw.indexOf('.');
      if (dotIndex !== -1) {
        const intPart = raw.slice(0, dotIndex);
        const decPart = raw.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2);
        raw = `${intPart}.${decPart}`;
      }
    }

    onChange(raw);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Currency Symbol Prefix Adornment */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
        {currencySymbol}
      </div>

      {/* Masked Text Input */}
      <input
        type="text"
        inputMode="decimal"
        id={id}
        aria-label={ariaLabel || `Amount in ${currency}`}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        autoComplete="off"
        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-16 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono font-semibold transition"
      />

      {/* ISO Currency Code Badge */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
          {currency}
        </span>
      </div>
    </div>
  );
}
