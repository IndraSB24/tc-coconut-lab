import {
  InsufficientBalanceError,
  InvalidAmountError,
  UnsupportedCurrencyError,
} from '../errors';
import {
  isSupportedCurrency,
  roundCurrency,
  formatCurrency,
  SupportedCurrency,
} from '../utils/currency-math';

export type WalletStatus = 'ACTIVE' | 'SUSPENDED';

export interface WalletProps {
  id: string;
  userId: string;
  currency: string;
  name?: string;
  balance?: number;
  status?: WalletStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// ---------------------------------------------------------------------------
// DOMAIN-DRIVEN DESIGN: RICH ENTITY PATTERN (ANTI-ANEMIC DATA MODEL)
// ---------------------------------------------------------------------------
// The balance state is private to strictly encapsulate financial invariants.
// State can ONLY transition through domain methods `deposit()` and `withdraw()`,
// preventing negative balances, NaN injections, or unrounded fractional amounts.
// ---------------------------------------------------------------------------
export class Wallet {
  public readonly id: string;
  public readonly userId: string;
  public readonly currency: SupportedCurrency;
  public readonly name: string;
  private _balance: number;
  private _status: WalletStatus;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: WalletProps) {
    if (!isSupportedCurrency(props.currency)) {
      throw new UnsupportedCurrencyError(props.currency);
    }

    this.id = props.id;
    this.userId = props.userId;
    this.currency = props.currency.toUpperCase() as SupportedCurrency;
    this.name = props.name?.trim() || `${this.currency} Main`;
    this._balance = roundCurrency(props.balance ?? 0, this.currency);
    this._status = props.status ?? 'ACTIVE';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    if (this._balance < 0) {
      throw new Error(`Wallet balance cannot be initialized with a negative amount: ${this._balance}`);
    }
  }

  public get balance(): number {
    return this._balance;
  }

  public get status(): WalletStatus {
    return this._status;
  }

  public deposit(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new InvalidAmountError(amount);
    }

    const roundedAmount = roundCurrency(amount, this.currency);
    this._balance = roundCurrency(this._balance + roundedAmount, this.currency);
    this.updatedAt = new Date();
    return this._balance;
  }

  public withdraw(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      throw new InvalidAmountError(amount);
    }

    const roundedAmount = roundCurrency(amount, this.currency);
    if (roundedAmount > this._balance) {
      throw new InsufficientBalanceError(this.currency, roundedAmount, this._balance);
    }

    this._balance = roundCurrency(this._balance - roundedAmount, this.currency);
    this.updatedAt = new Date();
    return this._balance;
  }

  public get formattedBalance(): string {
    return formatCurrency(this._balance, this.currency);
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      currency: this.currency,
      name: this.name,
      balance: this._balance,
      formattedBalance: this.formattedBalance,
      status: this._status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
