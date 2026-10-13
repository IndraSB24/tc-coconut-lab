'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { DEFAULT_MOCK_USER, MockUser } from '@/lib/mock-session';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

import {
  ActionTab,
  WalletData,
  TransactionData,
} from '@/components/wallet/types';
import { PortfolioOverview } from '@/components/wallet/PortfolioOverview';
import { WalletCardGrid } from '@/components/wallet/WalletCardGrid';
import { WalletActionWorkbench } from '@/components/wallet/WalletActionWorkbench';
import { LedgerAuditTable } from '@/components/wallet/LedgerAuditTable';
import { TransactionDetailModal } from '@/components/wallet/TransactionDetailModal';

export default function MultiCurrencyWalletWorkbench() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockUser>(DEFAULT_MOCK_USER);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [totalUsd, setTotalUsd] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ActionTab>('convert');

  // Form states
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [fromWalletId, setFromWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Filter states
  const [filterWalletId, setFilterWalletId] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // Detail Modal state
  const [selectedTx, setSelectedTx] = useState<TransactionData | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Wallets
  const fetchWallets = useCallback(async () => {
    try {
      const res = await fetch('/api/wallets');
      const json = await res.json();
      if (json.success && json.data) {
        setWallets(json.data.wallets);
        setTotalUsd(json.data.totalPortfolioEstimatedUsd);

        // Dynamically synchronize current user state with SQLite user record
        if (json.data.user) {
          setCurrentUser((prev) => ({
            ...prev,
            id: json.data.user.id,
            name: json.data.user.name,
            email: json.data.user.email,
          }));
        }

        if (json.data.wallets.length > 0) {
          if (!selectedWalletId) setSelectedWalletId(json.data.wallets[0].id);
          if (!fromWalletId) setFromWalletId(json.data.wallets[0].id);
          if (!toWalletId && json.data.wallets.length > 1) {
            setToWalletId(json.data.wallets[1].id);
          }
        }
      }
    } catch {
      showToast('error', 'Failed to fetch wallet balances');
    }
  }, [selectedWalletId, fromWalletId, toWalletId]);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    try {
      let url = '/api/transactions?limit=50';
      if (filterWalletId !== 'ALL') url += `&walletId=${filterWalletId}`;
      if (filterType !== 'ALL') url += `&type=${filterType}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setTransactions(json.data.transactions);
      }
    } catch {
      showToast('error', 'Failed to fetch transaction history');
    }
  }, [filterWalletId, filterType]);

  // Fetch Key Rates for Ticker
  const fetchRates = async () => {
    const quotes = ['EUR', 'GBP', 'SGD', 'IDR'];
    const ratesMap: Record<string, number> = {};
    for (const q of quotes) {
      try {
        const res = await fetch(`/api/rates?base=USD&quote=${q}`);
        const json = await res.json();
        if (json.success && json.data) {
          ratesMap[`USD_${q}`] = json.data.rate;
        }
      } catch {
        // Fallback handled gracefully
      }
    }
    setRates(ratesMap);
  };

  const refreshAll = async () => {
    setIsLoading(true);
    await Promise.all([fetchWallets(), fetchTransactions(), fetchRates()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [filterWalletId, filterType]);

  // Helper conversion rate calculation for preview in form
  const getSelectedConversionRate = () => {
    const fromW = wallets.find((w) => w.id === fromWalletId);
    const toW = wallets.find((w) => w.id === toWalletId);
    if (!fromW || !toW || fromW.currency === toW.currency) return 1.0;

    const directKey = `${fromW.currency}_${toW.currency}`;
    if (rates[directKey]) return rates[directKey];

    // Arbitrage approximation for instant preview (8-decimal high precision)
    const usdToFrom = rates[`USD_${fromW.currency}`] || (fromW.currency === 'USD' ? 1.0 : 1.0);
    const usdToTo = rates[`USD_${toW.currency}`] || (toW.currency === 'USD' ? 1.0 : 1.0);
    return Math.round((usdToTo / usdToFrom + Number.EPSILON) * 100000000) / 100000000;
  };

  // Action Form Submission
  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('error', 'Please enter a valid amount greater than 0');
      return;
    }

    setFormLoading(true);
    try {
      let endpoint = '';
      let bodyData: Record<string, unknown> = {};

      if (activeTab === 'deposit') {
        endpoint = `/api/wallets/${selectedWalletId}/deposit`;
        bodyData = { amount: numAmount, notes };
      } else if (activeTab === 'withdraw') {
        endpoint = `/api/wallets/${selectedWalletId}/withdraw`;
        bodyData = { amount: numAmount, notes };
      } else if (activeTab === 'convert') {
        if (fromWalletId === toWalletId) {
          showToast('error', 'Source and target currency wallets must be different');
          setFormLoading(false);
          return;
        }
        endpoint = '/api/wallets/convert';
        bodyData = { fromWalletId, toWalletId, amount: numAmount, notes };
      } else if (activeTab === 'transfer') {
        if (fromWalletId === toWalletId) {
          showToast('error', 'Source and destination wallets must be different');
          setFormLoading(false);
          return;
        }
        endpoint = '/api/wallets/transfer';
        bodyData = { fromWalletId, toWalletId, amount: numAmount, notes };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });
      const json = await res.json();

      if (json.success) {
        showToast('success', `Transaction successful! (Ref: ${json.data.referenceId || 'OK'})`);
        setAmount('');
        setNotes('');
        refreshAll();
      } else {
        showToast('error', json.error?.message || 'Transaction rejected by domain invariants');
      }
    } catch {
      showToast('error', 'Network error executing transaction');
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col"
        suppressHydrationWarning
      >
        <Navbar
          currentUser={currentUser}
          title="Coconut Lab"
          subtitle="Multi-Currency Digital Wallet (Frankfurter Engine)"
        />
        <div
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center"
          suppressHydrationWarning
        >
          <div
            className="flex-1 max-w-7xl w-full flex items-center justify-center gap-3 text-slate-400 text-sm"
            suppressHydrationWarning
          >
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span>Loading Multi-Currency Wallet Workbench...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col"
      suppressHydrationWarning
    >
      <Navbar
        currentUser={currentUser}
        title="Coconut Lab"
        subtitle="Multi-Currency Digital Wallet (Frankfurter Engine)"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modular Component 1: Portfolio Overview & Ticker */}
        <PortfolioOverview
          totalUsd={totalUsd}
          rates={rates}
          isLoading={isLoading}
          onRefresh={refreshAll}
        />

        {/* Modular Component 2: Currency Wallets Grid */}
        <WalletCardGrid
          wallets={wallets}
          onSelectWallet={(id) => {
            setSelectedWalletId(id);
            setFromWalletId(id);
          }}
          onRefresh={refreshAll}
        />

        {/* Modular Component 3: Operations Workbench Form */}
        <WalletActionWorkbench
          wallets={wallets}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedWalletId={selectedWalletId}
          setSelectedWalletId={setSelectedWalletId}
          fromWalletId={fromWalletId}
          setFromWalletId={setFromWalletId}
          toWalletId={toWalletId}
          setToWalletId={setToWalletId}
          amount={amount}
          setAmount={setAmount}
          notes={notes}
          setNotes={setNotes}
          formLoading={formLoading}
          onSubmit={handleSubmitAction}
          getSelectedConversionRate={getSelectedConversionRate}
        />

        {/* Modular Component 4: Immutable Ledger Audit Table */}
        <LedgerAuditTable
          transactions={transactions}
          wallets={wallets}
          filterWalletId={filterWalletId}
          setFilterWalletId={setFilterWalletId}
          filterType={filterType}
          setFilterType={setFilterType}
          onInspectTx={setSelectedTx}
          isLoading={isLoading}
        />
      </main>

      {/* Modular Component 5: Transaction Detail Inspector Modal */}
      <TransactionDetailModal
        selectedTx={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </div>
  );
}
