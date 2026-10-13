'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ReceiptText,
  RefreshCw,
} from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  toolbarSlot?: React.ReactNode;
  emptyMessage?: string;
  emptySubtext?: string;
  className?: string;
  isLoading?: boolean;
  debounceMs?: number;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  initialPageSize = 5,
  pageSizeOptions = [5, 10, 25],
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFilter,
  toolbarSlot,
  emptyMessage = 'No records found.',
  emptySubtext = 'Try adjusting your search query or active filters.',
  className = '',
  isLoading = false,
  debounceMs = 250,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Debounce search input to avoid recalculating filters on every keystroke
  useEffect(() => {
    if (debounceMs <= 0) {
      setDebouncedQuery(searchInput);
      setCurrentPage(1);
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setCurrentPage(1);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchInput, debounceMs]);

  // 1. FILTERING
  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    const query = debouncedQuery.toLowerCase().trim();
    if (searchFilter) {
      return data.filter((item) => searchFilter(item, query));
    }

    // Default search across all properties converted to string
    return data.filter((item) =>
      Object.values(item as Record<string, unknown>).some((val) =>
        String(val ?? '').toLowerCase().includes(query)
      )
    );
  }, [data, debouncedQuery, searchFilter]);

  // 2. SORTING
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    const column = columns.find((c) => c.id === sortKey);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (column.sortValue) {
        valA = column.sortValue(a);
        valB = column.sortValue(b);
      } else {
        const rawA = (a as Record<string, unknown>)[column.id];
        const rawB = (b as Record<string, unknown>)[column.id];
        valA = typeof rawA === 'number' ? rawA : String(rawA ?? '');
        valB = typeof rawB === 'number' ? rawB : String(rawB ?? '');
      }

      if (valA === valB) return 0;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // 3. PAGINATION MATH
  const totalRecords = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Reset page when totalPages shrinks below currentPage
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const startRecord = totalRecords === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRecord = Math.min(safeCurrentPage * pageSize, totalRecords);

  const handleHeaderClick = (column: ColumnDef<T>) => {
    if (!column.sortable) return;

    if (sortKey !== column.id) {
      setSortKey(column.id);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else if (sortDirection === 'desc') {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* TOOLBAR: Filter controls slot & Keyword search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">{toolbarSlot}</div>

        {searchable && (
          <div className="relative min-w-[16rem]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        )}
      </div>

      {/* TABLE DATA CONTAINER */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.id;
                const alignClass =
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left';

                return (
                  <th
                    key={col.id}
                    scope="col"
                    onClick={() => handleHeaderClick(col)}
                    className={`py-3.5 px-4 ${alignClass} ${
                      col.sortable
                        ? 'cursor-pointer select-none hover:text-white transition'
                        : ''
                    } ${col.headerClassName || ''}`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="shrink-0">
                          {isSorted && sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-400" />
                          ) : isSorted && sortDirection === 'desc' ? (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center font-sans space-y-2">
                    <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">
                      Loading records...
                    </p>
                    <p className="text-xs text-slate-500">
                      Synchronizing ledger with database...
                    </p>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center font-sans space-y-2">
                    <ReceiptText className="w-9 h-9 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-300">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-slate-500">{emptySubtext}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const key = keyExtractor(item);
                return (
                  <tr
                    key={key}
                    className="hover:bg-slate-800/40 transition group"
                  >
                    {columns.map((col) => {
                      const alignClass =
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left';
                      return (
                        <td
                          key={col.id}
                          className={`py-3 px-4 ${alignClass} ${col.className || ''}`}
                        >
                          {col.accessor
                            ? col.accessor(item)
                            : String(
                                (item as Record<string, unknown>)[col.id] ?? ''
                              )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Showing <strong className="text-slate-200">{startRecord}</strong> to{' '}
            <strong className="text-slate-200">{endRecord}</strong> of{' '}
            <strong className="text-slate-200">{totalRecords}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Rows:</span>
            <div className="inline-flex rounded-lg border border-slate-700/80 p-0.5 bg-slate-950">
              {pageSizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                    pageSize === size
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
            aria-label="Previous Page"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs font-medium text-slate-300">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            aria-label="Next Page"
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
