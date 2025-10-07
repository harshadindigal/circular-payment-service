import React, { useState } from 'react';
import styled from 'styled-components';
import { z } from 'zod';

// Types/Interfaces
export interface PaymentFormProps {
  onSubmit: (paymentData: PaymentData) => Promise<void>;
  initialValues?: Partial<PaymentData>;
  isProcessing?: boolean;
  // Issue: Inconsistent prop validation (some props not typed correctly)
  theme: any; 
}

export interface PaymentData {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  amount: number;
  currency: string;
}

// Styled components
const FormContainer = styled.div`
  max-width: 500px;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
`;

const FormTitle = styled.h2`
  margin-bottom: 24px;
  color: #333333;
  font-size: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555555;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
  
  &.error {
    border-color: #cc0000;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
  }
`;

const Row = styled.div`
  display: flex;
  gap: 16px;
`;

// Issue: Some inline styles instead of styled-components
const SubmitButton = styled.button`
  padding: 12px 24px;
  background-color: #0066cc;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: #0055aa;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #cc0000;
  font-size: 14px;
  margin-top: 4px;
`;

/**
 * Payment form component for collecting payment information
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  initialValues = {},
  isProcessing = false,
  theme,
}) => {
  const [formData, setFormData] = useState<Partial<PaymentData>>({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: 1,
    expiryYear: new Date().getFullYear(),
    cvv: '',
    amount: 0,
    currency: 'USD',
    ...initialValues,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' || name === 'expiryMonth' || name === 'expiryYear' 
        ? Number(value) 
        : value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Card number validation
    if (!formData.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^[0-9]{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    // Cardholder name validation
    if (!formData.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^[0-9]{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    // Amount validation
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    // Expiry date validation
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (formData.expiryYear === currentYear && formData.expiryMonth < currentMonth) {
      newErrors.expiryMonth = 'Card has expired';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData as PaymentData);
    } catch (error) {
      // Issue: Error messages too technical
      setSubmissionError('API Error 500: Transaction processing failed');
    }
  };
  
  // Generate years for expiry dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  return (
    // Issue: Not following component structure from guidelines
    <FormContainer>
      <FormTitle>Payment Details</FormTitle>
      
      {submissionError && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          {submissionError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="cardholderName">Cardholder Name</Label>
          <Input
            id="cardholderName"
            name="cardholderName"
            type="text"
            value={formData.cardholderName || ''}
            onChange={handleChange}
            className={errors.cardholderName ? 'error' : ''}
            // Issue: Missing ARIA attributes
          />
          {errors.cardholderName && (
            <ErrorMessage>{errors.cardholderName}</ErrorMessage>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            type="text"
            value={formData.cardNumber || ''}
            onChange={handleChange}
            className={errors.cardNumber ? 'error' : ''}
            aria-describedby="cardNumberError"
          />
          {errors.cardNumber && (
            <ErrorMessage id="cardNumberError">{errors.cardNumber}</ErrorMessage>
          )}
        </FormGroup>
        
        <Row>
          <FormGroup style={{ flex: 1 }}>
            <Label htmlFor="expiryMonth">Expiry Date</Label>
            <Row>
              <Select
                id="expiryMonth"
                name="expiryMonth"
                value={formData.expiryMonth || 1}
                onChange={handleChange}
                // Added some ARIA labels but not all
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {month.toString().padStart(2, '0')}
                  </option>
                ))}
              </Select>
              
              <Select
                id="expiryYear"
                name="expiryYear"
                value={formData.expiryYear || currentYear}
                onChange={handleChange}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Row>
            {errors.expiryMonth && (
              <ErrorMessage>{errors.expiryMonth}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup style={{ flex: 0.5 }}>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              name="cvv"
              type="text"
              maxLength={4}
              value={formData.cvv || ''}
              onChange={handleChange}
              className={errors.cvv ? 'error' : ''}
              // Added some ARIA labels but not all
            />
            {errors.cvv && (
              <ErrorMessage>{errors.cvv}</ErrorMessage>
            )}
          </FormGroup>
        </Row>
        
        <Row>
          <FormGroup style={{ flex: 2 }}>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleChange}
              className={errors.amount ? 'error' : ''}
              aria-describedby="amountError"
            />
            {errors.amount && (
              <ErrorMessage id="amountError">{errors.amount}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup style={{ flex: 1 }}>
            <Label htmlFor="currency">Currency</Label>
            <Select
              id="currency"
              name="currency"
              value={formData.currency || 'USD'}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </Select>
          </FormGroup>
        </Row>
        
        {/* Issue: Missing loading state for submit button */}
        <SubmitButton type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default PaymentForm;
