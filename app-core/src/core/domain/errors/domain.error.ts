export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code = 'DOMAIN_ERROR',
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID '${id}' was not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409);
    this.name = 'ConflictError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, code, 422);
    this.name = 'BusinessRuleViolationError';
  }
}

export class IllegalStateTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      `Illegal status transition: cannot transition from '${from}' to '${to}'`,
      'ILLEGAL_STATE_TRANSITION',
      400
    );
    this.name = 'IllegalStateTransitionError';
  }
}

// === Multi-Currency Digital Wallet Domain Errors ===

export class InsufficientBalanceError extends DomainError {
  constructor(currency: string, required: number, available: number) {
    super(
      `Insufficient balance in ${currency} wallet: requested ${required}, available ${available}`,
      'INSUFFICIENT_BALANCE',
      422
    );
    this.name = 'InsufficientBalanceError';
  }
}

export class InvalidAmountError extends DomainError {
  constructor(amount: number) {
    super(
      `Invalid transaction amount: ${amount}. Amount must be greater than 0`,
      'INVALID_AMOUNT',
      400
    );
    this.name = 'InvalidAmountError';
  }
}

export class WalletNotFoundError extends DomainError {
  constructor(walletId: string) {
    super(`Wallet with ID '${walletId}' was not found`, 'WALLET_NOT_FOUND', 404);
    this.name = 'WalletNotFoundError';
  }
}

export class SelfTransferError extends DomainError {
  constructor() {
    super('Source and destination wallets cannot be identical', 'SELF_TRANSFER_PROHIBITED', 400);
    this.name = 'SelfTransferError';
  }
}

export class UnsupportedCurrencyError extends DomainError {
  constructor(currency: string) {
    super(
      `Currency '${currency}' is not supported. Supported currencies: USD, EUR, GBP, SGD, IDR`,
      'UNSUPPORTED_CURRENCY',
      400
    );
    this.name = 'UnsupportedCurrencyError';
  }
}

export class ExchangeRateUnavailableError extends DomainError {
  constructor(base: string, quote: string, reason?: string) {
    super(
      `Exchange rate from ${base} to ${quote} is temporarily unavailable${reason ? `: ${reason}` : ''}`,
      'EXCHANGE_RATE_UNAVAILABLE',
      502
    );
    this.name = 'ExchangeRateUnavailableError';
  }
}

export class CurrencyMismatchTransferError extends DomainError {
  constructor(fromCurrency: string, toCurrency: string) {
    super(
      `Inter-wallet transfers are strictly permitted between wallets of the same currency (attempted ${fromCurrency} to ${toCurrency}). Use Currency Conversion for cross-currency exchanges.`,
      'CURRENCY_MISMATCH_TRANSFER',
      400
    );
    this.name = 'CurrencyMismatchTransferError';
  }
}

export class SameCurrencyConversionError extends DomainError {
  constructor(currency: string) {
    super(
      `Currency conversion requires different source and destination currencies (attempted ${currency} to ${currency}). Use Transfer Funds for moving funds between wallets of the same currency.`,
      'SAME_CURRENCY_CONVERSION_PROHIBITED',
      400
    );
    this.name = 'SameCurrencyConversionError';
  }
}


