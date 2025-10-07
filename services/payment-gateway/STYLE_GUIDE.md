# Payment Gateway Style Guide

## Naming Conventions
- Services: PascalCase (PaymentProcessor)
- Functions: camelCase (processPayment)
- Constants: UPPER_SNAKE_CASE (MAX_RETRY_ATTEMPTS)

## Error Handling
- Use custom Error classes with error codes
- Always include context in error logs
- Never expose internal errors to clients

## Logging Standards
- Use winston with structured logging
- Include: correlationId, userId, timestamp, action
- Severity levels: error, warn, info, debug

## Security Requirements
- Validate all inputs with Zod schemas
- Sanitize user inputs
- Use helmet middleware
- Rate limit: 100 requests/minute per IP
