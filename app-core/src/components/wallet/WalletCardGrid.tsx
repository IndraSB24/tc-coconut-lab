'use client';

import React, { useState } from 'react';
import { Wallet as WalletIcon, Plus, Layers } from 'lucide-react';
import { WalletData } from './types';
import { CreateWalletModal } from './CreateWalletModal';

interface WalletCardGridProps {
  wallets: WalletData[];
  onSelectWallet?: (walletId: string) => void;
  onRefresh?: () => void;
}

const CURRENCY_CHIPS = ['ALL', 'USD', 'EUR', 'GBP', 'SGD', 'IDR'] as const;

export function WalletCardGrid({ wallets, onSelectWallet, onRefresh }: WalletCardGridProps) {
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredWallets = wallets.filter(
    (w) => currencyFilter === 'ALL' || w.currency === currencyFilter
  );

  return (
    <div>
      {/* Header with Title and Currency Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <WalletIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Active Currency Pockets</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {wallets.length} Total
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-sub-wallets grouped by ISO currency holdings</p>
          </div>
        </div>

        {/* Toolbar: Currency Filter Chips + Quick Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            {CURRENCY_CHIPS.map((chip) => {
              const count =
                chip === 'ALL' ? wallets.length : wallets.filter((w) => w.currency === chip).length;
              const isSelected = currencyFilter === chip;

              return (
                <button
                  key={chip}
                  onClick={() => setCurrencyFilter(chip)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{chip}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-5 w-[1px] bg-slate-800 shrink-0 hidden sm:block" />

          {/* Quick Action: New Pocket Button (Hybrid UX Pattern) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
            title="Create a new currency sub-pocket"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Pocket</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Carousel Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent snap-x">
        {filteredWallets.map((w) => (
          <div
            key={w.id}
            onClick={() => onSelectWallet?.(w.id)}
            className="min-w-[240px] sm:min-w-[270px] snap-start p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-indigo-500/10 hover:shadow-xl flex flex-col justify-between cursor-pointer group relative overflow-hidden"
          >
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-500 opacity-30 group-hover:opacity-100 transition" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {w.currency}
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>

              {/* Pocket Name */}
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition truncate mb-1">
                {w.name || `${w.currency} Main`}
              </h3>

              {/* Formatted Balance */}
              <p className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight font-mono">
                {w.formattedBalance}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="truncate max-w-[140px]">{w.id}</span>
              <span className="text-[11px] text-slate-400 group-hover:text-indigo-400 transition font-sans">
                Select ➔
              </span>
            </div>
          </div>
        ))}

        {/* Action Card: + Add New Pocket */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="min-w-[200px] sm:min-w-[220px] snap-start border-2 border-dashed border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-950/20 rounded-3xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-slate-400 hover:text-indigo-300 group"
        >
          <div className="p-3 rounded-2xl bg-slate-800/80 group-hover:bg-indigo-600 group-hover:text-white transition text-slate-300 shadow-md">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-white mt-1">New Sub-Pocket</span>
          <span className="text-[11px] text-slate-500 text-center">Add another currency wallet</span>
        </div>
      </div>

      {/* Embedded Create Wallet Modal */}
      <CreateWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => onRefresh?.()}
      />
    </div>
  );
}
