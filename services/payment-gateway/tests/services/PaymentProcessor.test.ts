import { PaymentProcessor, PaymentError } from '../../src/services/PaymentProcessor';
import axios from 'axios';
import { TransactionStatus } from '../../src/models/Transaction';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PaymentProcessor', () => {
  let paymentProcessor: PaymentProcessor;
  
  beforeEach(() => {
    paymentProcessor = new PaymentProcessor();
    jest.clearAllMocks();
  });
  
  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      // Arrange
      const amount = 1000;
      const currency = 'USD';
      const paymentMethod = {
        type: 'card',
        card: {
          number: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        }
      };
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          id: 'test_transaction_123',
          status: 'succeeded',
          amount: '1000',
          currency: 'USD'
        }
      });
      
      // Act
      const result = await paymentProcessor.processPayment(amount, currency, paymentMethod);
      
      // Assert
      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(result.amount).toBe(amount);
      expect(result.currency).toBe(currency);
      expect(result.providerTransactionId).toBe('test_transaction_123');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    
    it('should handle payment failure', async () => {
      // Arrange
      const amount = 1000;
      const currency = 'USD';
      const paymentMethod = {
        type: 'card',
        card: {
          number: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        }
      };
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: 'failed',
          error: {
            message: 'Card declined',
            code: 'card_declined'
          }
        }
      });
      
      // Act & Assert
      await expect(
        paymentProcessor.processPayment(amount, currency, paymentMethod)
      ).rejects.toThrow(PaymentError);
    });
    
    it('should handle network errors', async () => {
      // Arrange
      const amount = 1000;
      const currency = 'USD';
      const paymentMethod = {
        type: 'card',
        card: {
          number: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123'
        }
      };
      
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
      
      // Act & Assert
      await expect(
        paymentProcessor.processPayment(amount, currency, paymentMethod)
      ).rejects.toThrow(PaymentError);
    });
  });
  
  describe('processRefund', () => {
    it('should process a refund successfully', async () => {
      // Arrange
      const transactionId = 'test_transaction_123';
      const amount = 500;
      
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          id: 'test_refund_123',
          status: 'succeeded',
          amount: '500',
          currency: 'USD'
        }
      });
      
      // Act
      const result = await paymentProcessor.processRefund(transactionId, amount);
      
      // Assert
      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(result.amount).toBe(amount);
      expect(result.type).toBe('refund');
      expect(result.originalTransactionId).toBe(transactionId);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });
});
