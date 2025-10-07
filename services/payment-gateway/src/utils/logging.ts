import winston from 'winston';

// Configure logger - Updated - Updated - Updated
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'payment-gateway' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add correlation ID to log context
export const addCorrelationId = (correlationId: string): void => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    correlationId
  };
};

// Add user ID to log context
export const addUserId = (userId: string): void => {
  logger.defaultMeta = {
    ...logger.defaultMeta,
    userId
  };
};

// Reset log context
export const resetLogContext = (): void => {
  logger.defaultMeta = { service: 'payment-gateway' };
};
