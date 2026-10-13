// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CustomSelect, CustomSelectOption } from '@/components/wallet/CustomSelect';

const sampleOptions: CustomSelectOption[] = [
  {
    value: 'wallet-usd',
    label: 'USD Wallet',
    sublabel: '$20,700.00',
    badge: 'USD',
  },
  {
    value: 'wallet-idr',
    label: 'IDR Wallet',
    sublabel: 'Rp 15,000,000',
    badge: 'IDR',
  },
  {
    value: 'wallet-eur',
    label: 'EUR Wallet',
    sublabel: '€1,450.00',
    badge: 'EUR',
    disabled: true,
  },
];

describe('CustomSelect Component (Level 2 Unit Test)', () => {
  it('renders trigger button with active option label, badge, and balance sublabel', () => {
    render(
      <CustomSelect
        value="wallet-usd"
        onChange={vi.fn()}
        options={sampleOptions}
      />
    );

    expect(screen.getByText('USD Wallet')).toBeDefined();
    expect(screen.getByText('USD')).toBeDefined();
    expect(screen.getByText('$20,700.00')).toBeDefined();
    // Popover closed by default
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens floating popover on click and renders all options', () => {
    render(
      <CustomSelect
        value="wallet-usd"
        onChange={vi.fn()}
        options={sampleOptions}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeDefined();

    const options = screen.getAllByRole('option');
    expect(options.length).toBe(3);
    expect(screen.getByText('Rp 15,000,000')).toBeDefined();
  });

  it('calls onChange with selected value and closes popover when an option is clicked', () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value="wallet-usd"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    // Open popover
    fireEvent.click(screen.getByRole('button'));

    // Click IDR option
    const idrOption = screen.getByRole('option', { name: /IDR Wallet/ });
    fireEvent.click(idrOption);

    expect(handleChange).toHaveBeenCalledWith('wallet-idr');
    // Popover should close
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('does not select disabled options', () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        value="wallet-usd"
        onChange={handleChange}
        options={sampleOptions}
      />
    );

    // Open popover
    fireEvent.click(screen.getByRole('button'));

    // Click disabled EUR option
    const eurOption = screen.getByRole('option', { name: /EUR Wallet/ });
    fireEvent.click(eurOption);

    expect(handleChange).not.toHaveBeenCalled();
    // Popover stays open
    expect(screen.getByRole('listbox')).toBeDefined();
  });

  it('closes popover when pressing Escape key', () => {
    render(
      <CustomSelect
        value="wallet-usd"
        onChange={vi.fn()}
        options={sampleOptions}
      />
    );

    // Open popover
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeDefined();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes popover when clicking outside the component', () => {
    render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <CustomSelect
          value="wallet-usd"
          onChange={vi.fn()}
          options={sampleOptions}
        />
      </div>
    );

    // Open popover
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeDefined();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('renders compact size variant properly', () => {
    render(
      <CustomSelect
        value="wallet-idr"
        onChange={vi.fn()}
        options={sampleOptions}
        size="compact"
        aria-label="Filter Wallet"
      />
    );

    const trigger = screen.getByLabelText('Filter Wallet');
    expect(trigger).toBeDefined();
    expect(screen.getByText('IDR Wallet')).toBeDefined();
  });
});
