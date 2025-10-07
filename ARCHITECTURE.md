# Circular Platform Architecture

## Overview
Circular is a fintech platform providing payment processing and lending services. This monorepo contains all the services and shared components that make up the Circular platform.

## Monorepo Structure
- **services/**: Contains all backend services
  - **payment-gateway/**: Handles payment processing and transactions
  - **lending-engine/**: Manages loan applications and risk assessment
- **packages/**: Contains shared libraries and components
  - **shared-components/**: UI components used across frontend applications
- **docs/**: Documentation for security, compliance, and code review

## Service Interaction Patterns
1. **Event-driven communication**: Services communicate via message queues for asynchronous operations
2. **REST APIs**: Direct service-to-service communication for synchronous operations
3. **Shared libraries**: Common code is extracted into shared packages

## Shared Component Usage
- Components should be imported from `@circular/shared-components`
- All UI elements must follow the design system guidelines
- Components handle their own state management and API interactions

## Compliance Requirements
- **PCI-DSS**: Payment Card Industry Data Security Standard for handling payment data
- **SOX**: Sarbanes-Oxley requirements for financial reporting
- **GDPR & CCPA**: Data privacy regulations
- **Fair Lending**: Equal Credit Opportunity Act compliance

## Development Guidelines
- Follow service-specific style guides and .cursorrules
- All code must pass automated tests and security scans
- Code reviews must use the checklist in docs/CODE_REVIEW_CHECKLIST.md
