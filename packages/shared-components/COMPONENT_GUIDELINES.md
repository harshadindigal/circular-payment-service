# Component Development Guidelines

## Component Structure
```tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Styled components
// 4. Component definition
// 5. Default export
```

## Accessibility Requirements
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratio > 4.5:1
- Screen reader tested

## Testing Requirements
- Unit tests with React Testing Library
- Accessibility tests with jest-axe
- Visual regression tests for critical components
- 80% minimum coverage
