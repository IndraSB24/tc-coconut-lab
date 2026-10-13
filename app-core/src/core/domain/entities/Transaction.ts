export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'CONVERT_OUT'
  | 'CONVERT_IN'
  | 'TRANSFER_OUT'
  | 'TRANSFER_IN';

export interface TransactionProps {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  balanceAfter: number;
  referenceId: string;
  counterpartyWalletId?: string | null;
  counterpartyCurrency?: string | null;
  exchangeRate?: number | null;
  notes?: string | null;
  createdAt?: Date;
}

export class Transaction {
  public readonly id: string;
  public readonly walletId: string;
  public readonly type: TransactionType;
  public readonly amount: number;
  public readonly currency: string;
  public readonly balanceAfter: number;
  public readonly referenceId: string;
  public readonly counterpartyWalletId?: string | null;
  public readonly counterpartyCurrency?: string | null;
  public readonly exchangeRate?: number | null;
  public readonly notes?: string | null;
  public readonly createdAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.walletId = props.walletId;
    this.type = props.type;
    this.amount = props.amount;
    this.currency = props.currency;
    this.balanceAfter = props.balanceAfter;
    this.referenceId = props.referenceId;
    this.counterpartyWalletId = props.counterpartyWalletId ?? null;
    this.counterpartyCurrency = props.counterpartyCurrency ?? null;
    this.exchangeRate = props.exchangeRate ?? null;
    this.notes = props.notes ?? null;
    this.createdAt = props.createdAt ?? new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      walletId: this.walletId,
      type: this.type,
      amount: this.amount,
      currency: this.currency,
      balanceAfter: this.balanceAfter,
      referenceId: this.referenceId,
      counterpartyWalletId: this.counterpartyWalletId,
      counterpartyCurrency: this.counterpartyCurrency,
      exchangeRate: this.exchangeRate,
      notes: this.notes,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
