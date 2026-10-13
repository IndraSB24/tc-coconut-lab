'use client';

import React, { useState } from 'react';
import { X, Plus, Wallet as WalletIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { CustomSelect, CustomSelectOption } from './CustomSelect';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CURRENCY_OPTIONS: CustomSelectOption[] = [
  { value: 'USD', label: 'US Dollar', sublabel: 'Standard fiat (cents)', badge: 'USD' },
  { value: 'EUR', label: 'Euro', sublabel: 'European Central Bank base', badge: 'EUR' },
  { value: 'GBP', label: 'British Pound', sublabel: 'Sterling account', badge: 'GBP' },
  { value: 'SGD', label: 'Singapore Dollar', sublabel: 'Asian trade hub', badge: 'SGD' },
  { value: 'IDR', label: 'Indonesian Rupiah', sublabel: 'Zero decimal (whole Rp)', badge: 'IDR' },
];

export function CreateWalletModal({ isOpen, onClose, onSuccess }: CreateWalletModalProps) {
  const [currency, setCurrency] = useState('USD');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name or label for this wallet pocket');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, name: name.trim() }),
      });

      const json = await res.json();

      if (json.success) {
        setName('');
        onSuccess();
        onClose();
      } else {
        setError(json.error?.message || 'Failed to create wallet');
      }
    } catch {
      setError('Network error while creating wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white p-1 rounded-lg transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
            <WalletIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create Sub-Wallet Pocket</h3>
            <p className="text-xs text-slate-400">Add a dedicated multi-currency account pot</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Select Currency
            </label>
            <CustomSelect
              value={currency}
              onChange={setCurrency}
              options={CURRENCY_OPTIONS}
              aria-label="Currency selection"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Wallet Pocket Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vacation Savings, Daily Expenses"
              maxLength={50}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Wallet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
