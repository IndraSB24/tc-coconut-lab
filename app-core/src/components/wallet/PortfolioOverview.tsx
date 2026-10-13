'use client';

import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

interface PortfolioOverviewProps {
  totalUsd: number;
  rates: Record<string, number>;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PortfolioOverview({
  totalUsd,
  rates,
  isLoading,
  onRefresh,
}: PortfolioOverviewProps) {
  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Multi-Currency Portfolio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Aggregated valuation calculated live via ECB rates from Frankfurter API.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div>
            <p className="text-xs uppercase font-medium text-slate-400">Total Portfolio (Est. USD)</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg disabled:opacity-50"
            title="Refresh Balances & Rates"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Rate Ticker */}
      <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="font-semibold text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Live Frankfurter FX Rates:
        </span>
        <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          1 USD = {rates['USD_EUR'] || '0.9215'} EUR
        </span>
        <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          1 USD = {rates['USD_GBP'] || '0.7910'} GBP
        </span>
        <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          1 USD = {rates['USD_SGD'] || '1.3520'} SGD
        </span>
        <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
          1 USD = {rates['USD_IDR'] || '15,850'} IDR
        </span>
      </div>
    </div>
  );
}
