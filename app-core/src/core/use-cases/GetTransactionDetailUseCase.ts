import { ITransactionRepository } from '../domain/repositories/ITransactionRepository';
import { Transaction } from '../domain/entities/Transaction';
import { NotFoundError } from '../domain/errors';

export class GetTransactionDetailUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(id: string): Promise<Transaction> {
    const tx = await this.transactionRepo.findById(id);
    if (!tx) {
      throw new NotFoundError('Transaction', id);
    }
    return tx;
  }
}
