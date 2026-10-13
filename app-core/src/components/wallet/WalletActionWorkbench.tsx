'use client';

import React, { useEffect } from 'react';
import {
  ArrowRightLeft,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { ActionTab, WalletData } from './types';
import { CurrencyAmountInput } from './CurrencyAmountInput';
import { CustomSelect, CustomSelectOption } from './CustomSelect';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  IDR: 'Rp',
};

interface WalletActionWorkbenchProps {
  wallets: WalletData[];
  activeTab: ActionTab;
  setActiveTab: (tab: ActionTab) => void;
  selectedWalletId: string;
  setSelectedWalletId: (id: string) => void;
  fromWalletId: string;
  setFromWalletId: (id: string) => void;
  toWalletId: string;
  setToWalletId: (id: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  formLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  getSelectedConversionRate: () => number;
}

export function WalletActionWorkbench({
  wallets,
  activeTab,
  setActiveTab,
  selectedWalletId,
  setSelectedWalletId,
  fromWalletId,
  setFromWalletId,
  toWalletId,
  setToWalletId,
  amount,
  setAmount,
  notes,
  setNotes,
  formLoading,
  onSubmit,
  getSelectedConversionRate,
}: WalletActionWorkbenchProps) {
  const fromWallet = wallets.find((w) => w.id === fromWalletId) || wallets[0];
  const toWallet = wallets.find((w) => w.id === toWalletId) || wallets[1];
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];

  const walletOptions: CustomSelectOption[] = wallets.map((w) => ({
    value: w.id,
    label: w.name ? `${w.name}` : `${w.currency} Pocket`,
    sublabel: w.formattedBalance,
    badge: w.currency,
  }));

  // Filter transfer destination wallets strictly to same currency
  const transferToOptions: CustomSelectOption[] = wallets
    .filter((w) => fromWallet && w.currency === fromWallet.currency && w.id !== fromWallet.id)
    .map((w) => ({
      value: w.id,
      label: w.name ? `${w.name}` : `${w.currency} Pocket`,
      sublabel: w.formattedBalance,
      badge: w.currency,
    }));

  // Filter convert destination wallets strictly to different currencies (Cross-Currency Invariant)
  const convertToOptions: CustomSelectOption[] = wallets
    .filter((w) => fromWallet && w.currency !== fromWallet.currency)
    .map((w) => ({
      value: w.id,
      label: w.name ? `${w.name}` : `${w.currency} Pocket`,
      sublabel: w.formattedBalance,
      badge: w.currency,
    }));

  // Auto-align toWalletId when tab changes, fromWallet changes, or options change
  useEffect(() => {
    if (activeTab === 'transfer') {
      if (transferToOptions.length > 0) {
        if (!transferToOptions.some((opt) => opt.value === toWalletId)) {
          setToWalletId(transferToOptions[0].value);
        }
      }
    } else if (activeTab === 'convert') {
      if (convertToOptions.length > 0) {
        if (!convertToOptions.some((opt) => opt.value === toWalletId)) {
          setToWalletId(convertToOptions[0].value);
        }
      }
    }
  }, [activeTab, fromWalletId, toWalletId, transferToOptions.length, convertToOptions.length]);

  const fromSymbol = fromWallet ? CURRENCY_SYMBOLS[fromWallet.currency] || '$' : '$';
  const toSymbol = toWallet ? CURRENCY_SYMBOLS[toWallet.currency] || '€' : '€';
  const selectedSymbol = selectedWallet ? CURRENCY_SYMBOLS[selectedWallet.currency] || '$' : '$';

  const rate = getSelectedConversionRate();
  const displayRate =
    rate < 0.0001
      ? rate.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })
      : rate < 0.01
      ? rate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })
      : rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const targetDecimals = toWallet?.currency === 'IDR' || toWallet?.currency === 'JPY' ? 0 : 2;
  const sourceDecimals = fromWallet?.currency === 'IDR' || fromWallet?.currency === 'JPY' ? 0 : 2;
  const numAmount = parseFloat(amount);

  const estReceived = !isNaN(numAmount) && numAmount > 0
    ? (numAmount * rate).toLocaleString('en-US', {
        minimumFractionDigits: targetDecimals,
        maximumFractionDigits: targetDecimals,
      })
    : targetDecimals === 0 ? '0' : '0.00';

  const formattedSourceAmount = !isNaN(numAmount) && numAmount > 0
    ? numAmount.toLocaleString('en-US', {
        minimumFractionDigits: sourceDecimals,
        maximumFractionDigits: sourceDecimals,
      })
    : amount;

  const handleSwapCurrencies = () => {
    if (fromWalletId && toWalletId) {
      const prevFrom = fromWalletId;
      setFromWalletId(toWalletId);
      setToWalletId(prevFrom);
    }
  };

  const getSubmitButtonLabel = () => {
    if (formLoading) {
      return (
        <>
          <RefreshCw className="w-5 h-5 animate-spin" />
          Processing Invariants...
        </>
      );
    }

    if (activeTab === 'convert') {
      if (convertToOptions.length === 0) {
        return 'No Alternative Currency Available to Convert';
      }
      if (!isNaN(numAmount) && numAmount > 0 && fromWallet && toWallet) {
        return `Convert ${formattedSourceAmount} ${fromWallet.currency} to ${estReceived} ${toWallet.currency}`;
      }
      return 'Execute CONVERT';
    }

    if (activeTab === 'transfer') {
      if (transferToOptions.length === 0) {
        return 'Create Second Pocket to Enable Transfer';
      }
      if (!isNaN(numAmount) && numAmount > 0 && fromWallet && toWallet) {
        return `Transfer ${formattedSourceAmount} ${fromWallet.currency} to ${toWallet.name || toWallet.currency + ' Pocket'}`;
      }
      return 'Execute TRANSFER';
    }

    const selectedDecimals = selectedWallet?.currency === 'IDR' ? 0 : 2;
    const formattedSelectedAmount = !isNaN(numAmount) && numAmount > 0
      ? numAmount.toLocaleString('en-US', {
          minimumFractionDigits: selectedDecimals,
          maximumFractionDigits: selectedDecimals,
        })
      : '';

    if (activeTab === 'deposit') {
      return formattedSelectedAmount
        ? `Deposit ${formattedSelectedAmount} ${selectedWallet?.currency || 'USD'}`
        : `Execute DEPOSIT (${selectedWallet?.currency || 'USD'})`;
    }

    return formattedSelectedAmount
      ? `Withdraw ${formattedSelectedAmount} ${selectedWallet?.currency || 'USD'}`
      : `Execute WITHDRAW (${selectedWallet?.currency || 'USD'})`;
  };

  const isTransferBlocked = activeTab === 'transfer' && transferToOptions.length === 0;
  const isConvertBlocked = activeTab === 'convert' && convertToOptions.length === 0;

  const renderIntelligenceCard = () => {
    if (activeTab === 'convert') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                FX Settlement Guarantee
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              ECB Rate Engine
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Exchange Benchmark</span>
                <span className="text-slate-200 font-mono">Frankfurter API</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Spread / Markup</span>
                <span className="text-emerald-400 font-bold font-mono">0.00% (Mid-Market)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Precision Scale</span>
                <span className="text-slate-200 font-mono">8 Decimals (10⁻⁸)</span>
              </div>
              {numAmount > 0 && fromWallet && toWallet && (
                <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Guaranteed Yield</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {toSymbol} {estReceived}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Double-Entry Ledger Invariant</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Conversion atomically records paired <code className="text-indigo-300 bg-indigo-950/60 px-1 py-0.5 rounded">CONVERT_OUT</code> and <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded">CONVERT_IN</code> entries tied to a shared Correlation UUID.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'transfer') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Internal Book Transfer
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              1:1 Parity
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Transfer Type</span>
                <span className="text-slate-200 font-mono">Inter-Pocket Allocation</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>FX Conversion Fee</span>
                <span className="text-emerald-400 font-bold font-mono">Rp 0 / $0 (Free)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Settlement Latency</span>
                <span className="text-indigo-400 font-bold font-mono">Instant (Atomic)</span>
              </div>
              {numAmount > 0 && fromWallet && toWallet && (
                <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Credited to Pocket</span>
                  <span className="text-indigo-300 font-mono font-bold text-sm">
                    {fromSymbol} {formattedSourceAmount}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Strict Same-Currency Guard</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Funds move strictly between accounts of identical currency (e.g. Main to Savings). Cross-currency transfers are prohibited by domain invariant.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'deposit') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Liquidity Sandbox
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Direct Credit
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Inflow Channel</span>
                <span className="text-slate-200 font-mono">Simulated Top-Up</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Processing Fee</span>
                <span className="text-emerald-400 font-bold font-mono">0.00%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Destination Pocket</span>
                <span className="text-slate-200 font-mono">{selectedWallet?.currency} ({selectedWallet?.name || 'Main'})</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-1.5 text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Single-Entry Credit Invariant</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Direct external liquidity injection emits a single-entry <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded">DEPOSIT</code> transaction verifying precision subunits.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Treasury Outflow Guard
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
            Strict Non-Negative
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Debit Channel</span>
              <span className="text-slate-200 font-mono">Treasury Withdrawal</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Max Allowable</span>
              <span className="text-rose-400 font-bold font-mono">{selectedWallet?.formattedBalance}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Target Pocket</span>
              <span className="text-slate-200 font-mono">{selectedWallet?.currency} ({selectedWallet?.name || 'Main'})</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 space-y-1.5 text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Overdraft Protection Invariant</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Withdrawals exceeding current pocket balance are immediately rejected with <code className="text-rose-300 bg-rose-950/60 px-1 py-0.5 rounded">InsufficientBalanceError</code> before persistence.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('convert')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'convert'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Convert Currencies
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'transfer'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          Transfer Funds
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'deposit'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Deposit Simulated Funds
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === 'withdraw'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdraw Funds
        </button>
      </div>

      {/* 2-Column Responsive Layout: Form on Left (7 cols), Live Intelligence on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive Transaction Form */}
        <form onSubmit={onSubmit} className="space-y-6 lg:col-span-7">
        {/* ==================================================================== */}
        {/* TAB 1: CONVERT CURRENCIES (Wise / Revolut Standard Fintech UX)        */}
        {/* ==================================================================== */}
        {activeTab === 'convert' && (
          <div className="space-y-4">
            {/* Section A: Debit Currency & Amount */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  You Convert (Sell Amount)
                </span>
                {fromWallet && (
                  <button
                    type="button"
                    onClick={() => setAmount(fromWallet.balance.toString())}
                    className="text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Max: {fromWallet.formattedBalance}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <CustomSelect
                  value={fromWalletId}
                  onChange={setFromWalletId}
                  options={walletOptions}
                  aria-label="Source Wallet"
                />

                <CurrencyAmountInput
                  value={amount}
                  onChange={setAmount}
                  currency={fromWallet?.currency || 'USD'}
                  symbol={fromSymbol}
                  placeholder={fromWallet?.currency === 'IDR' ? '0' : '0.00'}
                  required
                />
              </div>
            </div>

            {/* Section B: Mid-Market Live Rate & Currency Swap Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 py-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </div>
                <span>
                  Mid-Market Rate:{' '}
                  <span className="font-mono text-emerald-400 font-bold">
                    1 {fromWallet?.currency || 'USD'} = {displayRate} {toWallet?.currency || 'EUR'}
                  </span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleSwapCurrencies}
                title="Swap source and destination currencies"
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5 border border-slate-700/80 shadow-sm"
              >
                <span>⇄ Swap Currencies</span>
              </button>
            </div>

            {/* Section C: Target Currency Credit & Real-Time Estimated Yield */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  You Receive (Estimated Yield)
                </span>
                {toWallet && (
                  <span className="text-xs text-slate-400">
                    Target Balance: {toWallet.formattedBalance}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <CustomSelect
                  value={toWalletId}
                  onChange={setToWalletId}
                  options={convertToOptions}
                  aria-label="Target Wallet"
                />

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-400 font-mono">
                    {toSymbol}
                  </span>
                  <div
                    data-testid="est-received-amount"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3 pl-10 pr-16 font-mono text-base font-bold text-emerald-400 truncate shadow-inner"
                  >
                    {estReceived}
                  </div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {toWallet?.currency || 'EUR'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: TRANSFER FUNDS (Strict 1:1 Same Currency Internal Transfers)   */}
        {/* ==================================================================== */}
        {activeTab === 'transfer' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  From Pocket (Debit)
                </label>
                <CustomSelect
                  value={fromWalletId}
                  onChange={setFromWalletId}
                  options={walletOptions}
                  aria-label="From Pocket (Debit)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                  To Pocket (Credit - Same Currency)
                </label>
                {transferToOptions.length > 0 ? (
                  <CustomSelect
                    value={toWalletId}
                    onChange={setToWalletId}
                    options={transferToOptions}
                    aria-label="To Pocket (Credit)"
                  />
                ) : (
                  <div className="h-[46px] px-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center text-xs text-amber-300">
                    No secondary {fromWallet?.currency} pocket
                  </div>
                )}
              </div>
            </div>

            {/* Alert when only 1 wallet of this currency exists */}
            {transferToOptions.length === 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div>
                  <span className="font-bold">
                    You only have 1 {fromWallet?.currency} pocket.
                  </span>
                  <p className="text-amber-400/80 mt-0.5">
                    Inter-wallet transfers are strictly 1:1 within the same currency. Click{' '}
                    <strong>'+ New Sub-Pocket'</strong> above to create a secondary pocket, or switch
                    to <strong>'Convert Currencies'</strong> for FX exchange.
                  </p>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">
                  Transfer Amount ({fromWallet?.currency || 'USD'})
                </label>
                {fromWallet && (
                  <button
                    type="button"
                    onClick={() => setAmount(fromWallet.balance.toString())}
                    className="text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Max Available
                  </button>
                )}
              </div>
              <CurrencyAmountInput
                value={amount}
                onChange={setAmount}
                currency={fromWallet?.currency || 'USD'}
                symbol={fromSymbol}
                placeholder={fromWallet?.currency === 'IDR' ? '0' : '0.00'}
                required
              />
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3 & 4: DEPOSIT & WITHDRAW                                        */}
        {/* ==================================================================== */}
        {(activeTab === 'deposit' || activeTab === 'withdraw') && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
                Select Target Pocket
              </label>
              <CustomSelect
                value={selectedWalletId}
                onChange={setSelectedWalletId}
                options={walletOptions}
                aria-label="Select Target Pocket"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">
                  {activeTab === 'deposit' ? 'Deposit Amount' : 'Withdrawal Amount'} (
                  {selectedWallet?.currency || 'USD'})
                </label>
                {activeTab === 'withdraw' && selectedWallet && (
                  <button
                    type="button"
                    onClick={() => setAmount(selectedWallet.balance.toString())}
                    className="text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Max Available
                  </button>
                )}
              </div>
              <CurrencyAmountInput
                value={amount}
                onChange={setAmount}
                currency={selectedWallet?.currency || 'USD'}
                symbol={selectedSymbol}
                placeholder={selectedWallet?.currency === 'IDR' ? '0' : '0.00'}
                required
              />
            </div>
          </div>
        )}

        {/* Transaction Memo / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
            Transaction Memo / Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly allocation or vacation conversion"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={formLoading || isTransferBlocked || isConvertBlocked}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:cursor-not-allowed"
        >
          {getSubmitButtonLabel()}
        </button>
      </form>

      {/* Right Column: Live Ledger Intelligence & Transparency Panel */}
      <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-950/60 border border-slate-800/80 relative overflow-hidden backdrop-blur-sm shadow-xl">
        {/* Subtle Ambient Lighting Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {renderIntelligenceCard()}
      </div>
    </div>
  </div>
);
}
