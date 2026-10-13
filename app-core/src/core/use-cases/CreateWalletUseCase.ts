import { IWalletRepository } from '../domain/repositories/IWalletRepository';
import { Wallet } from '../domain/entities/Wallet';
import {
  ConflictError,
  UnsupportedCurrencyError,
  ValidationError,
} from '../domain/errors';
import { isSupportedCurrency, SupportedCurrency } from '../domain/utils/currency-math';

export interface CreateWalletDTO {
  userId: string;
  currency: string;
  name?: string;
}

export interface CreateWalletResult {
  wallet: Wallet;
}

export class CreateWalletUseCase {
  constructor(private walletRepo: IWalletRepository) {}

  async execute(dto: CreateWalletDTO): Promise<CreateWalletResult> {
    if (!dto.userId || typeof dto.userId !== 'string') {
      throw new ValidationError('User ID is required to create a wallet');
    }

    if (!dto.currency || !isSupportedCurrency(dto.currency)) {
      throw new UnsupportedCurrencyError(dto.currency || 'UNKNOWN');
    }

    const normCurrency = dto.currency.toUpperCase() as SupportedCurrency;
    const trimmedName = dto.name?.trim() || `${normCurrency} Secondary`;

    if (trimmedName.length > 50) {
      throw new ValidationError('Wallet name cannot exceed 50 characters');
    }

    // Check for naming conflict within the same user and currency
    const userWallets = await this.walletRepo.findByUserId(dto.userId);
    const hasNameConflict = userWallets.some(
      (w) => w.currency === normCurrency && w.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (hasNameConflict) {
      throw new ConflictError(
        `A ${normCurrency} wallet named '${trimmedName}' already exists for this user`
      );
    }

    const walletId = `wallet-${normCurrency.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const wallet = new Wallet({
      id: walletId,
      userId: dto.userId,
      currency: normCurrency,
      name: trimmedName,
      balance: 0.0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.walletRepo.save(wallet);

    return { wallet };
  }
}
