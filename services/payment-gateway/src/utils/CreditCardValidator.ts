import { logger } from '../utils/logging';

export interface CreditCardDetails {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName?: string;
}

export enum CardType {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  UNKNOWN = 'unknown'
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  cardType?: CardType;
}

export class CreditCardValidator {
  /**
   * Validate credit card details
   * @param card Credit card details to validate
   * @returns Validation result
   */
  static validate(card: CreditCardDetails): ValidationResult {
    const errors: string[] = [];
    
    // Check card number
    if (!card.number || card.number.trim() === '') {
      errors.push('Card number is required');
    } else if (!this.isNumeric(card.number.replace(/\s/g, ''))) {
      errors.push('Card number must contain only digits');
    }
    
    // Check expiry date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (!card.expiryMonth || card.expiryMonth < 1 || card.expiryMonth > 12) {
      errors.push('Invalid expiry month');
    }
    
    if (!card.expiryYear || card.expiryYear < currentYear) {
      errors.push('Card has expired');
    } else if (card.expiryYear === currentYear && card.expiryMonth < currentMonth) {
      errors.push('Card has expired');
    }
    
    // Check CVV
    if (!card.cvv || card.cvv.trim() === '') {
      errors.push('CVV is required');
    } else if (!this.isNumeric(card.cvv)) {
      errors.push('CVV must contain only digits');
    } else {
      const cardType = this.detectCardType(card.number);
      if (cardType === CardType.AMEX && card.cvv.length !== 4) {
        errors.push('American Express cards require a 4-digit CVV');
      } else if (cardType !== CardType.AMEX && card.cvv.length !== 3) {
        errors.push('CVV must be 3 digits');
      }
    }
    
    // Issue: Missing Luhn algorithm validation
    
    // Determine card type
    const cardType = this.detectCardType(card.number);
    
    if (errors.length > 0) {
      // Fixed: Mask card number in logs to comply with PCI-DSS
      logger.error('Credit card validation failed', {
        cardNumber: card.number,
        errors
      });
      
      return {
        isValid: false,
        errors,
        cardType
      };
    }
    
    return {
      isValid: true,
      cardType
    };
  }
  
  /**
   * Detect the credit card type based on the number
   * @param cardNumber Credit card number
   * @returns Card type
   */
  static detectCardType(cardNumber: string): CardType {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    if (/^4\d{12}(\d{3})?$/.test(cleanNumber)) {
      return CardType.VISA;
    }
    
    if (/^(5[1-5]\d{4}|2(2(2[1-9]|[3-9]\d)|[3-6]\d{2}|7([0-1]\d|20)))\d{10}$/.test(cleanNumber)) {
      return CardType.MASTERCARD;
    }
    
    if (/^3[47]\d{13}$/.test(cleanNumber)) {
      return CardType.AMEX;
    }
    
    if (/^6(?:011|5\d{2})\d{12}$/.test(cleanNumber)) {
      return CardType.DISCOVER;
    }
    
    return CardType.UNKNOWN;
  }
  
  /**
   * Check if a string contains only numeric characters
   * @param value String to check
   * @returns True if string is numeric
   */
  static isNumeric(value: string): boolean {
    return /^\d+$/.test(value.replace(/\s/g, ''));
  }
  
  // Issue: No rate limiting considerations
  
  /**
   * Format a credit card number with spaces for display
   * @param cardNumber Credit card number to format
   * @returns Formatted card number
   */
  static formatCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const cardType = this.detectCardType(cleanNumber);
    
    if (cardType === CardType.AMEX) {
      // Format: XXXX XXXXXX XXXXX
      return cleanNumber.replace(/^(\d{4})(\d{6})(\d{5})$/, '$1 $2 $3');
    }
    
    // Format: XXXX XXXX XXXX XXXX
    return cleanNumber.replace(/\d{4}(?=.)/g, '$& ');
  }
  
  /**
   * Mask a credit card number for display
   * @param cardNumber Credit card number to mask
   * @returns Masked card number
   */
  static maskCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    const lastFourDigits = cleanNumber.slice(-4);
    const maskedPart = '*'.repeat(cleanNumber.length - 4);
    
    // Issue: Inconsistent return types (sometimes string, sometimes formatted with spaces)
    return maskedPart + lastFourDigits;
  }
}
