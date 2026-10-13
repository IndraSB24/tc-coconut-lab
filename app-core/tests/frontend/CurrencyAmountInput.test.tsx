// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  CurrencyAmountInput,
  formatMaskedCurrency,
} from '@/components/wallet/CurrencyAmountInput';

describe('formatMaskedCurrency Utility', () => {
  it('formats whole numbers with thousand separators', () => {
    expect(formatMaskedCurrency('1000', 'USD')).toBe('1,000');
    expect(formatMaskedCurrency('15000000', 'IDR')).toBe('15,000,000');
    expect(formatMaskedCurrency('50', 'EUR')).toBe('50');
  });

  it('preserves user-typed decimal point and limits to 2 decimal places for fiat', () => {
    expect(formatMaskedCurrency('1250.', 'USD')).toBe('1,250.');
    expect(formatMaskedCurrency('1250.5', 'USD')).toBe('1,250.5');
    expect(formatMaskedCurrency('1250.55', 'USD')).toBe('1,250.55');
    expect(formatMaskedCurrency('1250.559', 'USD')).toBe('1,250.55');
  });

  it('completely strips and disallows decimal point for zero-decimal currencies (IDR, JPY)', () => {
    expect(formatMaskedCurrency('15000000.', 'IDR')).toBe('15,000,000');
    expect(formatMaskedCurrency('15000000.50', 'IDR')).toBe('15,000,000'); // decimal fraction truncated for IDR
    expect(formatMaskedCurrency('50000.', 'JPY')).toBe('50,000');
  });

  it('returns empty string for empty input', () => {
    expect(formatMaskedCurrency('', 'USD')).toBe('');
  });
});

describe('CurrencyAmountInput Component (Level 2 Unit Test)', () => {
  it('renders masked display value with thousand commas and currency badge', () => {
    render(
      <CurrencyAmountInput
        value="15000000"
        onChange={vi.fn()}
        currency="IDR"
        symbol="Rp"
      />
    );

    expect(screen.getByDisplayValue('15,000,000')).toBeDefined();
    expect(screen.getByText('Rp')).toBeDefined();
    expect(screen.getByText('IDR')).toBeDefined();
  });

  it('formats USD input and strips commas when emitting raw string to onChange', () => {
    const handleChange = vi.fn();
    render(
      <CurrencyAmountInput
        value=""
        onChange={handleChange}
        currency="USD"
        symbol="$"
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '2500' } });

    // Emits raw numeric string without thousand commas to form state
    expect(handleChange).toHaveBeenCalledWith('2500');
  });

  it('handles intentional decimal input on USD and caps to 2 decimals', () => {
    const handleChange = vi.fn();
    render(
      <CurrencyAmountInput
        value="1250"
        onChange={handleChange}
        currency="USD"
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '1,250.75' } });

    expect(handleChange).toHaveBeenCalledWith('1250.75');
  });

  it('blocks decimal points completely when currency is IDR', () => {
    const handleChange = vi.fn();
    render(
      <CurrencyAmountInput
        value="50000"
        onChange={handleChange}
        currency="IDR"
        symbol="Rp "
      />
    );

    const input = screen.getByRole('textbox');
    // User tries to type '.' in IDR
    fireEvent.change(input, { target: { value: '50,000.' } });

    // Emits raw integer without decimal point
    expect(handleChange).toHaveBeenCalledWith('50000');
  });
});
