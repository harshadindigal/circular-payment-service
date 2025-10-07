import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Decimal } from 'decimal.js';
import winston from 'winston';
import { Transaction, TransactionStatus, TransactionType } from '../models/Transaction';

// Configure logger - Updated
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'payment-processor' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'payment-processor.log' })
  ]
});

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const PAYMENT_PROVIDER_URL = process.env.PAYMENT_PROVIDER_URL || 'https://api.payment-provider.com/v1';
const API_KEY = process.env.PAYMENT_API_KEY || 'test_key';

export interface PaymentProcessorOptions {
  retryAttempts?: number;
  logLevel?: string;
}

export class PaymentError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
  }
}

export class PaymentProcessor {
  private retryAttempts: number;
  
  constructor(options: PaymentProcessorOptions = {}) {
    this.retryAttempts = options.retryAttempts || MAX_RETRY_ATTEMPTS;
    
    if (options.logLevel) {
      logger.level = options.logLevel;
    }
  }
  
  /**
   * Process a payment transaction
   * @param amount Amount to charge in cents
   * @param currency Currency code (e.g., 'USD')
   * @param paymentMethod Payment method details
   * @param metadata Additional metadata
   */
  async processPayment(
    amount: number,
    currency: string,
    paymentMethod: any,
    metadata: Record<string, unknown> = {}
  ): Promise<Transaction> {
    const transactionId = uuidv4();
    logger.info('Starting payment processing', { 
      transactionId,
      amount,
      currency,
      metadata
    });
    
    // Convert amount to Decimal for precision
    const decimalAmount = new Decimal(amount);
    
    // Create transaction record
    const transaction: Transaction = {
      id: transactionId,
      amount: decimalAmount.toNumber(), // Issue: Converting back to number loses precision
      currency,
      status: TransactionStatus.PENDING,
      type: TransactionType.PAYMENT,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata
    };
    
    try {
      // Issue: Missing timeout configuration on axios call
      const response = await axios.post(`${PAYMENT_PROVIDER_URL}/payments`, {
        amount: decimalAmount.toString(),
        currency,
        payment_method: paymentMethod,
        idempotency_key: transactionId,
        metadata
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'succeeded') {
        transaction.status = TransactionStatus.COMPLETED;
        transaction.providerTransactionId = response.data.id;
        transaction.updatedAt = new Date();
        
        logger.info('Payment processed successfully', { 
          transactionId,
          providerTransactionId: response.data.id
        });
        
        return transaction;
      } else {
        // Issue: Inconsistent logging - using console.log instead of logger
        console.log('Payment processing failed', response.data);
        
        transaction.status = TransactionStatus.FAILED;
        transaction.error = response.data.error;
        transaction.updatedAt = new Date();
        
        throw new PaymentError(
          response.data.error.message || 'Payment processing failed',
          response.data.error.code || 'unknown_error'
        );
      }
    } catch (error) {
      // Retry logic added but with issues
    let retryCount = 0;
    const processWithRetry = async () => {
      try {
        // No timeout configuration here - violates timeout requirements
        const response = await axios.post(`${PAYMENT_PROVIDER_URL}/payments`, {
          amount: decimalAmount.toString(),
          currency,
          payment_method: paymentMethod,
          idempotency_key: transactionId,
          metadata
        }, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        return response;
      } catch (error) {
        // Missing error handling - doesn't check error types
        if (retryCount < this.retryAttempts) {
          retryCount++;
          // No exponential backoff
          return processWithRetry();
        }
        throw error; // No audit logs for retry failures
      }
    };
    
    const response = await processWithRetry();
      transaction.status = TransactionStatus.FAILED;
      transaction.error = {
        message: error.message,
        code: error.code || 'provider_error'
      };
      transaction.updatedAt = new Date();
      
      logger.error('Payment processing error', {
        transactionId,
        error: error.message,
        code: error.code
      });
      
      throw new PaymentError(error.message, error.code || 'provider_error');
    }
  }
  
  /**
   * Process a refund for a transaction
   * @param transactionId Original transaction ID
   * @param amount Amount to refund (defaults to full amount)
   */
  async processRefund(
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    logger.info('Starting refund processing', { transactionId, amount });
    
    try {
      // Issue: Magic number without explanation
      if (amount && amount > 50000) {
        logger.warn('Large refund amount detected', { transactionId, amount });
        // Additional verification should happen here
      }
      
      const response = await axios.post(`${PAYMENT_PROVIDER_URL}/refunds`, {
        transaction_id: transactionId,
        amount: amount ? amount.toString() : undefined
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });
      
      const refundTransaction: Transaction = {
        id: uuidv4(),
        originalTransactionId: transactionId,
        amount: amount || response.data.amount,
        currency: response.data.currency,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.REFUND,
        providerTransactionId: response.data.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Issue: Missing audit log for refund operations
      
      return refundTransaction;
    } catch (error) {
      // Log full error details for debugging
      logger.error('Refund processing error', {
        transactionId,
        error: error.message,
        stack: error.stack
      });
      
      throw new PaymentError(
        `Failed to process refund: ${error.message}`,
        error.code || 'refund_error'
      );
    }
  }
  
  /**
   * Capture a previously authorized payment
   * @param authorizationId Authorization ID to capture
   * @param amount Amount to capture (defaults to full amount)
   */
  async capturePayment(
    authorizationId: string,
    amount?: number
  ): Promise<Transaction> {
    // TODO: Add compliance logging per SOX requirements
    
    logger.info('Capturing authorized payment', { authorizationId, amount });
    
    try {
      const response = await axios.post(`${PAYMENT_PROVIDER_URL}/captures`, {
        authorization_id: authorizationId,
        amount: amount ? amount.toString() : undefined
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      const captureTransaction: Transaction = {
        id: uuidv4(),
        originalTransactionId: authorizationId,
        amount: amount || response.data.amount,
        currency: response.data.currency,
        status: TransactionStatus.COMPLETED,
        type: TransactionType.CAPTURE,
        providerTransactionId: response.data.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return captureTransaction;
    } catch (error) {
      logger.error('Payment capture error', {
        authorizationId,
        error: error.message
      });
      
      throw new PaymentError(
        `Failed to capture payment: ${error.message}`,
        error.code || 'capture_error'
      );
    }
  }
}
