# Code Review Checklist

## General
- [ ] Code follows style guide for the service
- [ ] All .cursorrules requirements met
- [ ] No hardcoded secrets or credentials
- [ ] Proper error handling implemented

## Compliance
- [ ] Audit logging added for sensitive operations
- [ ] No PII in logs
- [ ] Transaction IDs propagated correctly
- [ ] Proper error context included

## Security
- [ ] Input validation implemented
- [ ] Rate limiting considered
- [ ] Authentication checked
- [ ] SQL injection prevented

## Testing
- [ ] Unit tests added/updated
- [ ] Edge cases covered
- [ ] Integration tests if needed

## Performance
- [ ] No N+1 queries in database access
- [ ] Appropriate indexing for database queries
- [ ] Caching strategy where appropriate
- [ ] Resource-intensive operations are asynchronous

## Code Quality
- [ ] No code duplication
- [ ] Functions and methods are focused and small
- [ ] Naming is clear and consistent
- [ ] Comments explain why, not what
- [ ] No commented-out code

## Documentation
- [ ] API endpoints documented
- [ ] Complex algorithms explained
- [ ] README updated if needed
- [ ] Change log updated

## Financial Specific
- [ ] Decimal types used for monetary values (not floats)
- [ ] Currency always specified with amounts
- [ ] Financial calculations have unit tests with specific edge cases
- [ ] Rounding rules clearly defined and consistently applied

## Accessibility (Frontend)
- [ ] Semantic HTML elements used
- [ ] ARIA attributes on interactive elements
- [ ] Color contrast meets WCAG standards
- [ ] Keyboard navigation supported

## Monitoring & Observability
- [ ] Appropriate logging levels
- [ ] Key metrics identified for monitoring
- [ ] Error states are observable
- [ ] Health check endpoints if applicable
