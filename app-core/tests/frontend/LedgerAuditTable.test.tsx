// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LedgerAuditTable } from '@/components/wallet/LedgerAuditTable';
import { TransactionData, WalletData } from '@/components/wallet/types';

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

const mockTransactions: TransactionData[] = [
  {
    id: 'tx-1',
    walletId: 'wallet-usd',
    type: 'DEPOSIT',
    amount: 500,
    currency: 'USD',
    balanceAfter: 1000,
    referenceId: 'ref-dep-001',
    counterpartyWalletId: null,
    counterpartyCurrency: null,
    exchangeRate: null,
    notes: 'Initial deposit',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    walletId: 'wallet-usd',
    type: 'CONVERT_OUT',
    amount: 100,
    currency: 'USD',
    balanceAfter: 900,
    referenceId: 'ref-conv-002',
    counterpartyWalletId: 'wallet-eur',
    counterpartyCurrency: 'EUR',
    exchangeRate: 0.92,
    notes: 'Converted USD to EUR',
    createdAt: new Date().toISOString(),
  },
];

describe('LedgerAuditTable Component (Level 2 Unit Test)', () => {
  it('renders filter controls and transactions table with correct badges', () => {
    const handleInspect = vi.fn();
    render(
      <LedgerAuditTable
        transactions={mockTransactions}
        wallets={mockWallets}
        filterWalletId="ALL"
        setFilterWalletId={vi.fn()}
        filterType="ALL"
        setFilterType={vi.fn()}
        onInspectTx={handleInspect}
      />
    );

    expect(screen.getByText('Immutable Transaction Audit Ledger')).toBeDefined();
    expect(screen.getByText('ref-dep-001')).toBeDefined();
    expect(screen.getByText('ref-conv-002')).toBeDefined();
    expect(screen.getByText('DEPOSIT')).toBeDefined();
    expect(screen.getByText('CONVERT_OUT')).toBeDefined();
  });

  it('renders empty state prompt when transaction list is empty', () => {
    render(
      <LedgerAuditTable
        transactions={[]}
        wallets={mockWallets}
        filterWalletId="ALL"
        setFilterWalletId={vi.fn()}
        filterType="ALL"
        setFilterType={vi.fn()}
        onInspectTx={vi.fn()}
      />
    );

    expect(
      screen.getByText('No transaction records found matching filters.')
    ).toBeDefined();
  });

  it('triggers onInspectTx with transaction data when detail button is clicked', () => {
    const handleInspect = vi.fn();
    render(
      <LedgerAuditTable
        transactions={mockTransactions}
        wallets={mockWallets}
        filterWalletId="ALL"
        setFilterWalletId={vi.fn()}
        filterType="ALL"
        setFilterType={vi.fn()}
        onInspectTx={handleInspect}
      />
    );

    const detailButtons = screen.getAllByText('Detail');
    fireEvent.click(detailButtons[0]);

    expect(handleInspect).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('renders loading state when isLoading is true', () => {
    render(
      <LedgerAuditTable
        transactions={mockTransactions}
        wallets={mockWallets}
        filterWalletId="ALL"
        setFilterWalletId={vi.fn()}
        filterType="ALL"
        setFilterType={vi.fn()}
        onInspectTx={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading records...')).toBeDefined();
    expect(screen.getByText('Synchronizing ledger with database...')).toBeDefined();
  });
});
