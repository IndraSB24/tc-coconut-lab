// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WalletCardGrid } from '@/components/wallet/WalletCardGrid';
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
  {
    id: 'wallet-gbp',
    userId: 'user-simulated',
    currency: 'GBP',
    balance: 300.0,
    formattedBalance: '£300.00',
    status: 'ACTIVE',
  },
  {
    id: 'wallet-sgd',
    userId: 'user-simulated',
    currency: 'SGD',
    balance: 400.0,
    formattedBalance: 'S$400.00',
    status: 'ACTIVE',
  },
  {
    id: 'wallet-idr',
    userId: 'user-simulated',
    currency: 'IDR',
    balance: 15000000.0,
    formattedBalance: 'Rp 15,000,000',
    status: 'ACTIVE',
  },
];

describe('WalletCardGrid Component (Level 2 Unit Test)', () => {
  it('renders all 5 currency wallets with correct balances and active badges', () => {
    render(<WalletCardGrid wallets={mockWallets} />);

    expect(screen.getAllByText('USD').length).toBeGreaterThan(0);
    expect(screen.getByText('$1,000.00')).toBeDefined();

    expect(screen.getAllByText('EUR').length).toBeGreaterThan(0);
    expect(screen.getByText('€500.00')).toBeDefined();

    expect(screen.getAllByText('IDR').length).toBeGreaterThan(0);
    expect(screen.getByText('Rp 15,000,000')).toBeDefined();

    const activeBadges = screen.getAllByText('ACTIVE');
    expect(activeBadges.length).toBe(5);
  });

  it('triggers onSelectWallet handler when a currency card is clicked', () => {
    const handleSelect = vi.fn();
    render(<WalletCardGrid wallets={mockWallets} onSelectWallet={handleSelect} />);

    const idrCard = screen.getByText('Rp 15,000,000');
    fireEvent.click(idrCard);

    expect(handleSelect).toHaveBeenCalledWith('wallet-idr');
  });

  it('renders Hybrid UX New Pocket quick action button and opens modal when clicked', () => {
    render(<WalletCardGrid wallets={mockWallets} />);

    const newPocketBtn = screen.getByRole('button', { name: /new pocket/i });
    expect(newPocketBtn).toBeDefined();

    fireEvent.click(newPocketBtn);
    expect(screen.getByText(/create sub-wallet pocket/i)).toBeDefined();
  });
});
