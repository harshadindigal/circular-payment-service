import { Request, Response } from 'express';
import { PaymentProcessor, PaymentError } from '../../services/PaymentProcessor';
import { Transaction, TransactionStatus } from '../../models/Transaction';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'transaction-controller' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'transactions.log' })
  ]
});

const paymentProcessor = new PaymentProcessor();

export class TransactionController {
  /**
   * Create a new payment transaction
   * @route POST /transactions
   */
  async createTransaction(req: Request, res: Response): Promise<void> {
    const { amount, currency, paymentMethod, metadata } = req.body;
    const userId = req.headers['user-id'] as string;
    
    // Issue: Missing input validation
    
    try {
      logger.info('Creating new transaction', { userId, amount, currency });
      
      const transaction = await paymentProcessor.processPayment(
        amount,
        currency,
        paymentMethod,
        { ...metadata, userId }
      );
      
      res.status(201).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      // Issue: Inconsistent error responses
      if (error instanceof PaymentError) {
        logger.error('Payment error', { 
          userId, 
          error: error.message,
          code: error.code
        });
        
        res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        });
      } else {
        // Fixed: Removed sensitive data from error logs
        logger.error('Unexpected error processing payment', { 
          userId, 
          amount, 
          currency, 
          // Removed paymentMethod which could contain sensitive card data
          error: error.message
        });
        
        res.status(500).json({
          success: false,
          error: {
            message: 'An unexpected error occurred',
            code: 'internal_error'
          }
        });
      }
    }
  }
  
  /**
   * Get transaction by ID
   * @route GET /transactions/:id
   */
  async getTransaction(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    // Issue: One endpoint missing authentication check
    // Should check for user authentication here
    
    try {
      // Simulating database fetch
      const transaction: Transaction = {
        id,
        amount: 1000,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        type: 'payment',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error('Error fetching transaction', { id, error: error.message });
      
      // Issue: Not following error format from STYLE_GUIDE.md
      res.status(500).send('Internal server error');
    }
  }
  
  /**
   * Process a refund
   * @route POST /transactions/:id/refund
   */
  async refundTransaction(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.headers['user-id'] as string;
    
    // Issue: Missing rate limiting annotation
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'auth_required'
        }
      });
      return;
    }
    
    try {
      logger.info('Processing refund', { transactionId: id, amount, userId });
      
      const refundTransaction = await paymentProcessor.processRefund(id, amount);
      
      res.status(200).json({
        success: true,
        data: refundTransaction
      });
    } catch (error) {
      logger.error('Refund error', { 
        transactionId: id, 
        userId,
        error: error.message
      });
      
      // Issue: Inconsistent error responses
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new TransactionController();
