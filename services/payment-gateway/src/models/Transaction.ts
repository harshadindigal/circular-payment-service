import { Decimal } from 'decimal.js';

export type TransactionType = 'payment' | 'refund' | 'capture' | 'authorization';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export interface Transaction {
  id: string;
  originalTransactionId?: string;
  providerTransactionId?: string;
  amount: number | Decimal; // Should always use Decimal, but some places use number
  currency: string;
  status: TransactionStatus | string;
  type: TransactionType | string;
  metadata?: Record<string, unknown>;
  error?: {
    message: string;
    code: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionCreateParams {
  amount: number | string | Decimal;
  currency: string;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod {
  type: 'card' | 'bank_account' | 'wallet';
  card?: CardDetails;
  bankAccount?: BankAccountDetails;
  wallet?: WalletDetails;
}

export interface CardDetails {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName?: string;
}

export interface BankAccountDetails {
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  accountHolderName: string;
}

export interface WalletDetails {
  provider: 'apple_pay' | 'google_pay' | 'paypal';
  token: string;
}
