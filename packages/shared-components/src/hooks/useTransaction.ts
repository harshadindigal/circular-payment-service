import { useState, useEffect, useCallback } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  type: 'payment' | 'refund' | 'capture' | 'authorization';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TransactionError {
  message: string;
  code?: string;
}

export interface UseTransactionOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  onError?: (error: TransactionError) => void;
}

export interface UseTransactionResult {
  transaction: Transaction | null;
  isLoading: boolean;
  error: TransactionError | null;
  fetchTransaction: (id: string) => Promise<void>;
  refundTransaction: (id: string, amount?: number) => Promise<Transaction | null>;
}

/**
 * Hook for fetching and managing transaction data
 */
export const useTransaction = (options: UseTransactionOptions = {}): UseTransactionResult => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<TransactionError | null>(null);
  
  const baseUrl = options.baseUrl || '/api/transactions';
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Issue: Missing error boundary consideration
  
  const fetchTransaction = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/${id}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw {
          message: errorData.message || 'Failed to fetch transaction',
          code: errorData.code,
        };
      }
      
      const data = await response.json();
      setTransaction(data);
    } catch (err) {
      const errorObj: TransactionError = {
        message: err.message || 'An error occurred while fetching the transaction',
        code: err.code,
      };
      
      setError(errorObj);
      
      if (options.onError) {
        options.onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, headers, options.onError]);
  
  const refundTransaction = useCallback(async (
    id: string,
    amount?: number
  ): Promise<Transaction | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${baseUrl}/${id}/refund`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount }),
      });
      
      // Issue: Inconsistent error handling (try-catch in some places, .catch in others)
      if (!response.ok) {
        return response.json().then(errorData => {
          const errorObj: TransactionError = {
            message: errorData.message || 'Failed to refund transaction',
            code: errorData.code,
          };
          
          setError(errorObj);
          
          if (options.onError) {
            options.onError(errorObj);
          }
          
          return null;
        });
      }
      
      const refundData = await response.json();
      
      // Update the original transaction status
      if (transaction && transaction.id === id) {
        setTransaction({
          ...transaction,
          status: 'refunded',
        });
      }
      
      return refundData;
    } catch (err) {
      const errorObj: TransactionError = {
        message: err.message || 'An error occurred while refunding the transaction',
        code: err.code,
      };
      
      setError(errorObj);
      
      if (options.onError) {
        options.onError(errorObj);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, headers, transaction, options.onError]);
  
  // Issue: No retry logic on failed requests
  
  // Issue: State updates after unmount possible (missing cleanup)
  useEffect(() => {
    // This effect doesn't clean up properly
    const pollTransactionStatus = async () => {
      if (transaction && transaction.status === 'pending') {
        await fetchTransaction(transaction.id);
      }
    };
    
    if (transaction && transaction.status === 'pending') {
      const interval = setInterval(pollTransactionStatus, 5000);
      
      // Missing cleanup: should return () => clearInterval(interval)
    }
  }, [transaction, fetchTransaction]);
  
  return {
    transaction,
    isLoading,
    error,
    fetchTransaction,
    refundTransaction,
  };
};

export default useTransaction;
