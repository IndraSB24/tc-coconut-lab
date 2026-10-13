// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WalletActionWorkbench } from '@/components/wallet/WalletActionWorkbench';
import { WalletData } from '@/components/wallet/types';

const mockWallets: WalletData[] = [
  {
    id: 'wallet-usd',
    userId: 'user-simulated',
    currency: 'USD',
    balance: 1000.0,
    formattedBalance: '$1,000.00',
    status: 'ACTIVE',
  },
  {
    id: 'wallet-eur',
    userId: 'user-simulated',
    currency: 'EUR',
    balance: 500.0,
    formattedBalance: '€500.00',
    status: 'ACTIVE',
  },
];

describe('WalletActionWorkbench Component (Level 2 Unit Test)', () => {
  it('switches tabs and triggers setActiveTab callback', () => {
    const handleTabChange = vi.fn();
    render(
      <WalletActionWorkbench
        wallets={mockWallets}
        activeTab="convert"
        setActiveTab={handleTabChange}
        selectedWalletId="wallet-usd"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-usd"
        setFromWalletId={vi.fn()}
        toWalletId="wallet-eur"
        setToWalletId={vi.fn()}
        amount="100"
        setAmount={vi.fn()}
        notes="Test conversion"
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={vi.fn()}
        getSelectedConversionRate={() => 0.92}
      />
    );

    const withdrawTabBtn = screen.getByText('Withdraw Funds');
    fireEvent.click(withdrawTabBtn);
    expect(handleTabChange).toHaveBeenCalledWith('withdraw');

    const depositTabBtn = screen.getByText('Deposit Simulated Funds');
    fireEvent.click(depositTabBtn);
    expect(handleTabChange).toHaveBeenCalledWith('deposit');
  });

  it('renders explicit currency labels, rate ticker, and dynamic estimation in convert mode', () => {
    render(
      <WalletActionWorkbench
        wallets={mockWallets}
        activeTab="convert"
        setActiveTab={vi.fn()}
        selectedWalletId="wallet-usd"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-usd"
        setFromWalletId={vi.fn()}
        toWalletId="wallet-eur"
        setToWalletId={vi.fn()}
        amount="100"
        setAmount={vi.fn()}
        notes=""
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={vi.fn()}
        getSelectedConversionRate={() => 0.92}
      />
    );

    // Explicit Sell and Buy labels
    expect(screen.getByText('You Convert (Sell Amount)')).toBeDefined();
    expect(screen.getByText('You Receive (Estimated Yield)')).toBeDefined();

    // Mid-market rate badge
    expect(screen.getByText(/Mid-Market Rate:/)).toBeDefined();

    // Auto-calculated yield: 100 * 0.92 = 92.00
    const estInput = screen.getByText('92.00');
    expect(estInput).toBeDefined();
  });

  it('swaps source and destination wallets when swap button is clicked', () => {
    const setFromWalletId = vi.fn();
    const setToWalletId = vi.fn();

    render(
      <WalletActionWorkbench
        wallets={mockWallets}
        activeTab="convert"
        setActiveTab={vi.fn()}
        selectedWalletId="wallet-usd"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-usd"
        setFromWalletId={setFromWalletId}
        toWalletId="wallet-eur"
        setToWalletId={setToWalletId}
        amount="100"
        setAmount={vi.fn()}
        notes=""
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={vi.fn()}
        getSelectedConversionRate={() => 0.92}
      />
    );

    const swapBtn = screen.getByTitle('Swap source and destination currencies');
    fireEvent.click(swapBtn);

    expect(setFromWalletId).toHaveBeenCalledWith('wallet-eur');
    expect(setToWalletId).toHaveBeenCalledWith('wallet-usd');
  });

  it('renders dynamic contextual CTA label and handles form submit', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    render(
      <WalletActionWorkbench
        wallets={mockWallets}
        activeTab="convert"
        setActiveTab={vi.fn()}
        selectedWalletId="wallet-usd"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-usd"
        setFromWalletId={vi.fn()}
        toWalletId="wallet-eur"
        setToWalletId={vi.fn()}
        amount="50"
        setAmount={vi.fn()}
        notes="Vacation exchange"
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={handleSubmit}
        getSelectedConversionRate={() => 0.92}
      />
    );

    // Dynamic submit label: "Convert 50.00 USD to 46.00 EUR"
    const submitBtn = screen.getByText('Convert 50.00 USD to 46.00 EUR');
    expect(submitBtn).toBeDefined();
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalled();
  });

  it('sets max available balance when Max shortcut is clicked', () => {
    const setAmount = vi.fn();
    render(
      <WalletActionWorkbench
        wallets={mockWallets}
        activeTab="convert"
        setActiveTab={vi.fn()}
        selectedWalletId="wallet-usd"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-usd"
        setFromWalletId={vi.fn()}
        toWalletId="wallet-eur"
        setToWalletId={vi.fn()}
        amount=""
        setAmount={setAmount}
        notes=""
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={vi.fn()}
        getSelectedConversionRate={() => 0.92}
      />
    );

    const maxBtn = screen.getByText('Max: $1,000.00');
    fireEvent.click(maxBtn);
    expect(setAmount).toHaveBeenCalledWith('1000');
  });

  it('filters out same-currency wallets in convert target dropdown', () => {
    const multiWallets: WalletData[] = [
      ...mockWallets,
      {
        id: 'wallet-usd-2',
        userId: 'user-simulated',
        currency: 'USD',
        balance: 300.0,
        formattedBalance: '$300.00',
        name: 'USD Emergency',
        status: 'ACTIVE',
      },
    ];

    render(
      <WalletActionWorkbench
        wallets={multiWallets}
        activeTab="convert"
        setActiveTab={vi.fn()}
        selectedWalletId="wallet-usd"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-usd"
        setFromWalletId={vi.fn()}
        toWalletId="wallet-eur"
        setToWalletId={vi.fn()}
        amount=""
        setAmount={vi.fn()}
        notes=""
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={vi.fn()}
        getSelectedConversionRate={() => 0.92}
      />
    );

    // Click the target select trigger to open the options list
    const targetSelectBtn = screen.getByRole('button', { name: /Target Wallet/i });
    fireEvent.click(targetSelectBtn);

    // Target options should include EUR, but NOT USD Emergency or USD Main
    expect(screen.getByRole('option', { name: /EUR Pocket/i })).toBeDefined();
    expect(screen.queryByRole('option', { name: /USD Emergency/i })).toBeNull();
  });

  it('correctly calculates non-zero yield and formats micro-rate for IDR to EUR conversion', () => {
    const idrEurWallets: WalletData[] = [
      {
        id: 'wallet-idr',
        userId: 'user-simulated',
        currency: 'IDR',
        balance: 36000000.0,
        formattedBalance: 'Rp 36,000,000',
        name: 'IDR Main',
        status: 'ACTIVE',
      },
      {
        id: 'wallet-eur',
        userId: 'user-simulated',
        currency: 'EUR',
        balance: 500.0,
        formattedBalance: '€500.00',
        name: 'EUR Main',
        status: 'ACTIVE',
      },
    ];

    render(
      <WalletActionWorkbench
        wallets={idrEurWallets}
        activeTab="convert"
        setActiveTab={vi.fn()}
        selectedWalletId="wallet-idr"
        setSelectedWalletId={vi.fn()}
        fromWalletId="wallet-idr"
        setFromWalletId={vi.fn()}
        toWalletId="wallet-eur"
        setToWalletId={vi.fn()}
        amount="10000000"
        setAmount={vi.fn()}
        notes=""
        setNotes={vi.fn()}
        formLoading={false}
        onSubmit={vi.fn()}
        getSelectedConversionRate={() => 0.000058}
      />
    );

    // Yield: 10,000,000 * 0.000058 = 580.00 EUR (must NOT be 0.00 EUR)
    expect(screen.getByText('580.00')).toBeDefined();

    // Ticker displays non-zero micro-rate: "1 IDR = 0.000058 EUR"
    expect(screen.getByText(/0\.000058/)).toBeDefined();

    // Submit button label
    expect(screen.getByText(/Convert 10,000,000 IDR to 580\.00 EUR/)).toBeDefined();
  });
});
