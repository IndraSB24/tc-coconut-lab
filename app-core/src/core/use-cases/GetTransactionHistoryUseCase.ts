import { ITransactionRepository } from '../domain/repositories/ITransactionRepository';
import { Transaction, TransactionType } from '../domain/entities/Transaction';

export interface GetTransactionHistoryDTO {
  walletId?: string;
  type?: TransactionType;
  limit?: number;
}

export interface GetTransactionHistoryResult {
  total: number;
  transactions: Transaction[];
}

export class GetTransactionHistoryUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(dto: GetTransactionHistoryDTO = {}): Promise<GetTransactionHistoryResult> {
    const limit = dto.limit ?? 50;
    let list: Transaction[] = [];

    if (dto.walletId) {
      list = await this.transactionRepo.findByWalletId(dto.walletId, limit);
    } else {
      list = await this.transactionRepo.findAll(limit);
    }

    if (dto.type) {
      list = list.filter((t) => t.type === dto.type);
    }

    return {
      total: list.length,
      transactions: list,
    };
  }
}
