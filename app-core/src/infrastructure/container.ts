import { PrismaWalletRepository } from './repositories/PrismaWalletRepository';
import { PrismaTransactionRepository } from './repositories/PrismaTransactionRepository';
import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { FrankfurterExchangeRateService } from './services/FrankfurterExchangeRateService';
import { DepositFundsUseCase } from '@/core/use-cases/DepositFundsUseCase';
import { WithdrawFundsUseCase } from '@/core/use-cases/WithdrawFundsUseCase';
import { ConvertFundsUseCase } from '@/core/use-cases/ConvertFundsUseCase';
import { TransferFundsUseCase } from '@/core/use-cases/TransferFundsUseCase';
import { GetWalletsUseCase } from '@/core/use-cases/GetWalletsUseCase';
import { CreateWalletUseCase } from '@/core/use-cases/CreateWalletUseCase';
import { GetTransactionHistoryUseCase } from '@/core/use-cases/GetTransactionHistoryUseCase';
import { GetTransactionDetailUseCase } from '@/core/use-cases/GetTransactionDetailUseCase';

const walletRepo = new PrismaWalletRepository();
const transactionRepo = new PrismaTransactionRepository();
const userRepo = new PrismaUserRepository();
const exchangeRateService = new FrankfurterExchangeRateService({ ttlSeconds: 60 });

// ---------------------------------------------------------------------------
// COMPOSITION ROOT: LIGHTWEIGHT VANILLA DEPENDENCY INVERSION
// ---------------------------------------------------------------------------
// Avoided heavy runtime IoC reflection packages (Inversify/tsyringe) to keep 
// bundle size minimal, eliminate experimental decorators, and preserve 
// compatibility with Next.js Serverless and Edge compilation targets.
// ---------------------------------------------------------------------------
export const container = {
  walletRepo,
  transactionRepo,
  userRepo,
  exchangeRateService,
  createWalletUseCase: new CreateWalletUseCase(walletRepo),
  depositFundsUseCase: new DepositFundsUseCase(walletRepo, transactionRepo),
  withdrawFundsUseCase: new WithdrawFundsUseCase(walletRepo, transactionRepo),
  convertFundsUseCase: new ConvertFundsUseCase(walletRepo, transactionRepo, exchangeRateService),
  transferFundsUseCase: new TransferFundsUseCase(walletRepo, transactionRepo, exchangeRateService),
  getWalletsUseCase: new GetWalletsUseCase(walletRepo),
  getTransactionHistoryUseCase: new GetTransactionHistoryUseCase(transactionRepo),
  getTransactionDetailUseCase: new GetTransactionDetailUseCase(transactionRepo),
};
