import { z } from 'zod';

/**
 * Validation schema for payment data
 */
export const paymentSchema = z.object({
  cardNumber: z.string()
    .min(13, 'Card number must be at least 13 digits')
    .max(19, 'Card number must be at most 19 digits')
    .regex(/^[0-9]+$/, 'Card number must contain only digits'),
  
  cardholderName: z.string()
    .min(1, 'Cardholder name is required')
    .max(100, 'Cardholder name is too long'),
  
  expiryMonth: z.number()
    .int('Expiry month must be an integer')
    .min(1, 'Expiry month must be between 1 and 12')
    .max(12, 'Expiry month must be between 1 and 12'),
  
  expiryYear: z.number()
    .int('Expiry year must be an integer')
    .min(new Date().getFullYear(), 'Card has expired'),
  
  cvv: z.string()
    .regex(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits'),
  
  amount: z.number()
    .positive('Amount must be greater than zero'),
  
  currency: z.string()
    .min(3, 'Currency code must be 3 characters')
    .max(3, 'Currency code must be 3 characters')
});

/**
 * Validation schema for loan application data
 */
export const loanApplicationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  income: z.number().min(1, 'Income must be greater than zero'),
  employmentMonths: z.number().min(0, 'Employment months cannot be negative'),
  loanAmount: z.number().min(1000, 'Loan amount must be at least $1,000'),
  loanPurpose: z.string().min(1, 'Loan purpose is required'),
  loanTermMonths: z.number().min(6, 'Loan term must be at least 6 months'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
});

/**
 * Validate payment data
 * @param data The payment data to validate
 * @returns Validation result
 */
export const validatePayment = (data: unknown): { 
  success: boolean; 
  data?: z.infer<typeof paymentSchema>; 
  errors?: z.ZodError;
} => {
  try {
    const validData = paymentSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

/**
 * Validate loan application data
 * @param data The loan application data to validate
 * @returns Validation result
 */
export const validateLoanApplication = (data: unknown): {
  success: boolean;
  data?: z.infer<typeof loanApplicationSchema>;
  errors?: z.ZodError;
} => {
  try {
    const validData = loanApplicationSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

/**
 * Validate credit card number using Luhn algorithm
 * @param cardNumber The credit card number to validate
 * @returns Whether the card number is valid
 */
export const validateCreditCardNumber = (cardNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check if the number is valid length
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through the digits in reverse order
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

/**
 * Detect credit card type based on number
 * @param cardNumber The credit card number
 * @returns The card type
 */
export const detectCardType = (cardNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Visa
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^(5[1-5]|2(2(2[1-9]|[3-9])|[3-6]|7([0-1]|20)))/.test(cleaned)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  
  // Discover
  if (/^(6011|65|64[4-9]|622)/.test(cleaned)) {
    return 'discover';
  }
  
  return 'unknown';
};
