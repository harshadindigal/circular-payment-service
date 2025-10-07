import React from 'react';
import styled from 'styled-components';

// Types/Interfaces
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  type: 'payment' | 'refund' | 'capture' | 'authorization';
  description?: string;
}

export interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails?: (transactionId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

// Styled components
const Container = styled.div`
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f5f5f5;
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #555555;
  border-bottom: 1px solid #dddddd;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #fafafa;
  }
  
  &:hover {
    background-color: #f0f7ff;
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #eeeeee;
`;

const StatusBadge = styled.span<{ status: Transaction['status'] }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
      case 'completed':
        return 'background-color: #e6f7e6; color: #2e7d32;';
      case 'pending':
        return 'background-color: #fff8e1; color: #f57c00;';
      case 'failed':
        return 'background-color: #ffebee; color: #c62828;';
      case 'canceled':
        return 'background-color: #eeeeee; color: #616161;';
      default:
        return '';
    }
  }}
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #0066cc;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  padding: 32px;
  text-align: center;
  color: #757575;
`;

const LoadingState = styled.div`
  padding: 32px;
  text-align: center;
  color: #757575;
`;

const ErrorState = styled.div`
  padding: 16px;
  text-align: center;
  color: #c62828;
  background-color: #ffebee;
`;

/**
 * TransactionList component displays a list of transactions in a table format
 */
export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onViewDetails,
  isLoading = false,
  error = null,
}) => {
  // Format currency amount
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };
  
  // Format transaction type for display
  const formatType = (type: Transaction['type']): string => {
    switch (type) {
      case 'payment':
        return 'Payment';
      case 'refund':
        return 'Refund';
      case 'capture':
        return 'Capture';
      case 'authorization':
        return 'Authorization';
      default:
        return type;
    }
  };
  
  if (isLoading) {
    return (
      <Container>
        <LoadingState>Loading transactions...</LoadingState>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <ErrorState>{error}</ErrorState>
      </Container>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <Container>
        <EmptyState>No transactions found</EmptyState>
      </Container>
    );
  }
  
  return (
    <Container>
      <Table>
        <TableHead>
          <tr>
            <TableHeader>Date</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Amount</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Description</TableHeader>
            {onViewDetails && <TableHeader>Actions</TableHeader>}
          </tr>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{formatType(transaction.type)}</TableCell>
              <TableCell>{formatAmount(transaction.amount, transaction.currency)}</TableCell>
              <TableCell>
                <StatusBadge status={transaction.status}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </StatusBadge>
              </TableCell>
              <TableCell>{transaction.description || '-'}</TableCell>
              {onViewDetails && (
                <TableCell>
                  <ActionButton
                    onClick={() => onViewDetails(transaction.id)}
                    aria-label={`View details for transaction ${transaction.id}`}
                  >
                    View Details
                  </ActionButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default TransactionList;
