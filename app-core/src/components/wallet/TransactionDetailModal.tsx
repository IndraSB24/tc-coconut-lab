'use client';

import React from 'react';
import { X, Layers } from 'lucide-react';
import { TransactionData } from './types';

interface TransactionDetailModalProps {
  selectedTx: TransactionData | null;
  onClose: () => void;
}

export function TransactionDetailModal({
  selectedTx,
  onClose,
}: TransactionDetailModalProps) {
  if (!selectedTx) return null;

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'WITHDRAWAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'CONVERT_OUT':
      case 'TRANSFER_OUT':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'CONVERT_IN':
      case 'TRANSFER_IN':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Transaction Details</h3>
            <p className="text-xs text-slate-400 font-mono">ID: {selectedTx.id}</p>
          </div>
        </div>

        <div className="space-y-4 text-sm divide-y divide-slate-800">
          <div className="pt-2 flex justify-between">
            <span className="text-slate-400">Type</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold border ${getBadgeColor(
                selectedTx.type
              )}`}
            >
              {selectedTx.type}
            </span>
          </div>

          <div className="pt-3 flex justify-between">
            <span className="text-slate-400">Amount</span>
            <span className="font-mono font-bold text-white">
              {selectedTx.amount} {selectedTx.currency}
            </span>
          </div>

          <div className="pt-3 flex justify-between">
            <span className="text-slate-400">Balance After</span>
            <span className="font-mono font-bold text-emerald-400">
              {selectedTx.balanceAfter} {selectedTx.currency}
            </span>
          </div>

          <div className="pt-3 flex justify-between">
            <span className="text-slate-400">Correlation Ref ID</span>
            <span className="font-mono text-xs text-indigo-300 truncate max-w-[200px]">
              {selectedTx.referenceId}
            </span>
          </div>

          {selectedTx.counterpartyWalletId && (
            <div className="pt-3 flex justify-between">
              <span className="text-slate-400">Counterparty Wallet</span>
              <span className="font-mono text-xs text-slate-200">
                {selectedTx.counterpartyWalletId} ({selectedTx.counterpartyCurrency})
              </span>
            </div>
          )}

          {selectedTx.exchangeRate && (
            <div className="pt-3 flex justify-between">
              <span className="text-slate-400">Exchange Rate Applied</span>
              <span className="font-mono font-bold text-amber-400">
                {selectedTx.exchangeRate}
              </span>
            </div>
          )}

          <div className="pt-3 flex justify-between">
            <span className="text-slate-400">Timestamp</span>
            <span className="text-slate-200 text-xs">
              {new Date(selectedTx.createdAt).toLocaleString()}
            </span>
          </div>

          {selectedTx.notes && (
            <div className="pt-3">
              <span className="block text-slate-400 text-xs mb-1">Memo / Notes</span>
              <p className="p-3 bg-slate-950 rounded-xl text-slate-300 text-xs font-mono">
                {selectedTx.notes}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
