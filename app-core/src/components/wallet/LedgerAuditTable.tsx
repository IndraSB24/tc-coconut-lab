'use client';

import React from 'react';
import { History, ExternalLink } from 'lucide-react';
import { TransactionData, WalletData } from './types';
import { CustomSelect, CustomSelectOption } from './CustomSelect';
import { DataTable, ColumnDef } from './DataTable';

interface LedgerAuditTableProps {
  transactions: TransactionData[];
  wallets: WalletData[];
  filterWalletId: string;
  setFilterWalletId: (id: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  onInspectTx: (tx: TransactionData) => void;
  isLoading?: boolean;
}

export function LedgerAuditTable({
  transactions,
  wallets,
  filterWalletId,
  setFilterWalletId,
  filterType,
  setFilterType,
  onInspectTx,
  isLoading = false,
}: LedgerAuditTableProps) {
  const walletFilterOptions: CustomSelectOption[] = [
    { value: 'ALL', label: 'All Wallets' },
    ...wallets.map((w) => ({
      value: w.id,
      label: `${w.currency} Wallet`,
      badge: w.currency,
    })),
  ];

  const typeFilterOptions: CustomSelectOption[] = [
    { value: 'ALL', label: 'All Types' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'CONVERT_OUT', label: 'Convert Out' },
    { value: 'CONVERT_IN', label: 'Convert In' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out' },
    { value: 'TRANSFER_IN', label: 'Transfer In' },
  ];

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

  const columns: ColumnDef<TransactionData>[] = [
    {
      id: 'createdAt',
      header: 'Date / Time',
      sortable: true,
      sortValue: (tx) => new Date(tx.createdAt).getTime(),
      accessor: (tx) => (
        <span className="text-slate-300 font-mono">
          {new Date(tx.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      sortable: true,
      accessor: (tx) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold border font-sans ${getBadgeColor(
            tx.type
          )}`}
        >
          {tx.type}
        </span>
      ),
    },
    {
      id: 'currency',
      header: 'Wallet',
      sortable: true,
      accessor: (tx) => (
        <span className="text-slate-200 font-bold">{tx.currency}</span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      sortable: true,
      sortValue: (tx) => tx.amount,
      accessor: (tx) => {
        const isPositive = tx.type.includes('IN') || tx.type === 'DEPOSIT';
        return (
          <span
            className={`font-bold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '+' : '-'}
            {tx.amount.toLocaleString()} {tx.currency}
          </span>
        );
      },
    },
    {
      id: 'balanceAfter',
      header: 'Balance After',
      sortable: true,
      sortValue: (tx) => tx.balanceAfter,
      accessor: (tx) => (
        <span className="text-slate-300">
          {tx.balanceAfter.toLocaleString()} {tx.currency}
        </span>
      ),
    },
    {
      id: 'referenceId',
      header: 'Reference ID',
      accessor: (tx) => (
        <span className="text-slate-400 truncate max-w-[150px] inline-block font-mono">
          {tx.referenceId}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Inspect',
      align: 'right',
      accessor: (tx) => (
        <button
          onClick={() => onInspectTx(tx)}
          className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded text-[11px] font-medium transition inline-flex items-center gap-1 font-sans cursor-pointer"
        >
          Detail
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      {/* Header section */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          Immutable Transaction Audit Ledger
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Every balance change creates a correlated double-entry audit record.
        </p>
      </div>

      <DataTable<TransactionData>
        data={transactions}
        columns={columns}
        keyExtractor={(tx) => tx.id}
        initialPageSize={5}
        pageSizeOptions={[5, 10, 25]}
        searchable={true}
        searchPlaceholder="Search reference, currency..."
        emptyMessage="No transaction records found matching filters."
        emptySubtext="Adjust wallet/type filters or search query to find records."
        isLoading={isLoading}
        toolbarSlot={
          <div className="flex flex-wrap items-center gap-2.5">
            <CustomSelect
              value={filterWalletId}
              onChange={setFilterWalletId}
              options={walletFilterOptions}
              size="compact"
              aria-label="Filter Wallet"
            />

            <CustomSelect
              value={filterType}
              onChange={setFilterType}
              options={typeFilterOptions}
              size="compact"
              aria-label="Filter Type"
            />
          </div>
        }
      />
    </div>
  );
}
