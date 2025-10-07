/**
 * Utility functions for formatting values
 */

/**
 * Format a currency amount
 * @param amount The amount to format
 * @param currency The currency code
 * @returns Formatted currency string
 */
// Issue: Missing internationalization for currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  // Issue: Hardcoded USD symbol
  const symbol = currency === 'USD' ? '$' : 
                currency === 'EUR' ? '€' : 
                currency === 'GBP' ? '£' : 
                currency;
  
  // Issue: No edge case handling for very large numbers
  const formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${symbol}${formattedAmount}`;
};

/**
 * Format a date string
 * @param dateString The date string to format
 * @param format The format to use (short, medium, long)
 * @returns Formatted date string
 */
// Issue: Date formatting not timezone-aware
export const formatDate = (
  dateString: string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string => {
  const date = new Date(dateString);
  
  switch (format) {
    case 'short':
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'medium':
    default:
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
};

/**
 * Format a date and time string
 * @param dateString The date string to format
 * @param includeSeconds Whether to include seconds
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string, includeSeconds: boolean = false): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  if (includeSeconds) {
    options.second = '2-digit';
  }
  
  return date.toLocaleString('en-US', options);
};

/**
 * Format a phone number
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the number is valid
  if (cleaned.length < 10) {
    return phoneNumber; // Return original if invalid
  }
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX for international
  return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
};

/**
 * Format a credit card number
 * @param cardNumber The card number to format
 * @returns Formatted card number
 */
export const formatCreditCardNumber = (cardNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check if the number is valid
  if (cleaned.length < 13 || cleaned.length > 19) {
    return cardNumber; // Return original if invalid
  }
  
  // Format as XXXX XXXX XXXX XXXX
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Mask a credit card number for display
 * @param cardNumber The card number to mask
 * @returns Masked card number
 */
export const maskCreditCardNumber = (cardNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check if the number is valid
  if (cleaned.length < 13 || cleaned.length > 19) {
    return cardNumber; // Return original if invalid
  }
  
  // Keep last 4 digits, mask the rest
  const lastFour = cleaned.slice(-4);
  const maskedPart = '•'.repeat(cleaned.length - 4);
  
  // Format with spaces
  const formatted = (maskedPart + lastFour).replace(/(.{4})/g, '$1 ').trim();
  
  return formatted;
};

/**
 * Format a file size
 * @param bytes The file size in bytes
 * @param decimals The number of decimal places
 * @returns Formatted file size
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
