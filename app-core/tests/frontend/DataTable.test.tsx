// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DataTable, ColumnDef } from '@/components/wallet/DataTable';

interface MockItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

const mockData: MockItem[] = [
  { id: '1', name: 'Alpha Transaction', amount: 100, category: 'Deposit' },
  { id: '2', name: 'Bravo Transaction', amount: 50, category: 'Withdraw' },
  { id: '3', name: 'Charlie Transaction', amount: 300, category: 'Convert' },
  { id: '4', name: 'Delta Transaction', amount: 150, category: 'Transfer' },
  { id: '5', name: 'Echo Transaction', amount: 20, category: 'Deposit' },
];

const mockColumns: ColumnDef<MockItem>[] = [
  {
    id: 'name',
    header: 'Name',
    sortable: true,
    accessor: (item) => <span data-testid={`name-${item.id}`}>{item.name}</span>,
  },
  {
    id: 'amount',
    header: 'Amount',
    sortable: true,
    sortValue: (item) => item.amount,
    align: 'right',
    accessor: (item) => <span>${item.amount}</span>,
  },
  {
    id: 'category',
    header: 'Category',
    sortable: false,
    accessor: (item) => <span>{item.category}</span>,
  },
];

describe('DataTable Component (Level 2 Unit Test)', () => {
  it('renders table headers, row accessors, and pagination summary', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        initialPageSize={2}
        pageSizeOptions={[2, 5]}
      />
    );

    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Amount')).toBeDefined();
    expect(screen.getByText('Category')).toBeDefined();

    // First page with pageSize=2
    expect(screen.getByTestId('name-1')).toBeDefined();
    expect(screen.getByTestId('name-2')).toBeDefined();
    expect(screen.queryByTestId('name-3')).toBeNull();

    expect(screen.getByText(/Showing/)).toBeDefined();
    expect(screen.getByText(/records/)).toBeDefined();
  });

  it('paginates forward and backward correctly', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        initialPageSize={2}
        pageSizeOptions={[2, 5]}
      />
    );

    const nextBtn = screen.getByLabelText('Next Page');
    fireEvent.click(nextBtn);

    // Page 2 should render items 3 and 4
    expect(screen.queryByTestId('name-1')).toBeNull();
    expect(screen.getByTestId('name-3')).toBeDefined();
    expect(screen.getByTestId('name-4')).toBeDefined();

    // Previous Page
    const prevBtn = screen.getByLabelText('Previous Page');
    fireEvent.click(prevBtn);

    expect(screen.getByTestId('name-1')).toBeDefined();
    expect(screen.getByTestId('name-2')).toBeDefined();
  });

  it('switches page size when row buttons are clicked', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        initialPageSize={2}
        pageSizeOptions={[2, 5]}
      />
    );

    expect(screen.queryByTestId('name-5')).toBeNull();

    const size5Btn = screen.getByRole('button', { name: '5' });
    fireEvent.click(size5Btn);

    // All 5 items now visible
    expect(screen.getByTestId('name-1')).toBeDefined();
    expect(screen.getByTestId('name-5')).toBeDefined();
  });

  it('sorts columns ascending, descending, and resets on successive header clicks', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        initialPageSize={5}
      />
    );

    const amountHeader = screen.getByText('Amount');

    // 1st click: Ascending (lowest amount first -> Echo: 20)
    fireEvent.click(amountHeader);
    const rowsAsc = screen.getAllByTestId(/name-/);
    expect(rowsAsc[0].textContent).toBe('Echo Transaction');

    // 2nd click: Descending (highest amount first -> Charlie: 300)
    fireEvent.click(amountHeader);
    const rowsDesc = screen.getAllByTestId(/name-/);
    expect(rowsDesc[0].textContent).toBe('Charlie Transaction');

    // 3rd click: Reset to original order (Alpha: 100)
    fireEvent.click(amountHeader);
    const rowsReset = screen.getAllByTestId(/name-/);
    expect(rowsReset[0].textContent).toBe('Alpha Transaction');
  });

  it('filters data dynamically via quick search input with debounce', () => {
    vi.useFakeTimers();
    try {
      render(
        <DataTable
          data={mockData}
          columns={mockColumns}
          keyExtractor={(item) => item.id}
          initialPageSize={5}
          searchPlaceholder="Filter items..."
          debounceMs={250}
        />
      );

      const searchInput = screen.getByPlaceholderText('Filter items...');
      fireEvent.change(searchInput, { target: { value: 'Delta' } });

      // Before timer advances, Alpha is still rendered (debounce protects onChange spam)
      expect(screen.getByTestId('name-1')).toBeDefined();

      // Advance timer by debounce duration
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(screen.getByTestId('name-4')).toBeDefined();
      expect(screen.queryByTestId('name-1')).toBeNull();
      expect(screen.queryByTestId('name-2')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('renders loading indicator when isLoading is true', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading records...')).toBeDefined();
    expect(screen.getByText('Synchronizing ledger with database...')).toBeDefined();
  });

  it('renders custom empty message when no records match', () => {
    render(
      <DataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        emptyMessage="Custom empty table notice."
      />
    );

    expect(screen.getByText('Custom empty table notice.')).toBeDefined();
  });

  it('renders toolbarSlot content properly', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={(item) => item.id}
        toolbarSlot={<button data-testid="custom-filter-btn">Custom Filter</button>}
      />
    );

    expect(screen.getByTestId('custom-filter-btn')).toBeDefined();
  });
});
