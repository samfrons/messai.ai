# MESSAI Testing Guide

## Overview

This guide covers the comprehensive testing infrastructure set up for the MESSAI
project, including unit tests, integration tests, E2E tests, and code coverage
reporting.

## Testing Stack

- **Jest**: Unit and integration testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for tests
- **Playwright**: End-to-end testing framework
- **jest-mock-extended**: Enhanced mocking capabilities for TypeScript

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests for a specific project
pnpm nx test web
```

### E2E Tests

```bash
# Run E2E tests (headless)
pnpm test:e2e

# Run E2E tests with browser UI
pnpm test:e2e:headed

# Open Playwright UI mode
pnpm test:e2e:ui

# Run E2E tests for specific browser
pnpm nx e2e web-e2e --project=chromium
```

### Coverage Reports

```bash
# Generate coverage report
pnpm coverage

# Open HTML coverage report
pnpm coverage:open

# Run tests with coverage in CI mode
pnpm test:ci
```

## Test Structure

### Unit Tests

Unit tests are colocated with the code they test:

```
src/
  components/
    Button.tsx
    __tests__/
      Button.test.tsx
  stores/
    useAppStore.ts
    __tests__/
      useAppStore.test.ts
```

### E2E Tests

E2E tests are located in the `apps/web-e2e/src` directory:

```
apps/web-e2e/
  src/
    home.spec.ts
    papers.spec.ts
    lab.spec.ts
```

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should handle click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Store Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState(useAppStore.getInitialState());
  });

  it('should update user', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setUser({ id: '1', name: 'Test User' });
    });

    expect(result.current.user).toEqual({ id: '1', name: 'Test User' });
  });
});
```

### API Route Tests

```typescript
import { NextRequest } from 'next/server';
import { GET } from '../route';
import { prisma } from '@messai/database';

jest.mock('@messai/database');

describe('GET /api/papers', () => {
  it('should return papers list', async () => {
    const mockPapers = [{ id: '1', title: 'Test Paper' }];
    (prisma.researchPaper.findMany as jest.Mock).mockResolvedValue(mockPapers);

    const request = new NextRequest('http://localhost:3000/api/papers');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.papers).toEqual(mockPapers);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Papers Page', () => {
  test('should search for papers', async ({ page }) => {
    await page.goto('/papers');

    // Search for papers
    await page.fill('input[name="search"]', 'microbial fuel cell');
    await page.press('input[name="search"]', 'Enter');

    // Check results
    await expect(page.locator('.paper-item')).toHaveCount(10);
    await expect(page).toHaveURL(/search=microbial/);
  });
});
```

## Test Utilities

### MSW Handlers

Mock API responses are defined in `apps/web/src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/papers', () => {
    return HttpResponse.json({
      data: { papers: [...] },
      error: null,
    });
  }),
];
```

### Store Test Utils

Utilities for testing Zustand stores are in
`apps/web/src/test-utils/store-test-utils.ts`:

```typescript
import { resetStore, updateStore, testSelector } from './store-test-utils';

// Reset store
resetStore(useAppStore, initialState);

// Update store in tests
updateStore(useAppStore, { user: mockUser });

// Test selectors
testSelector(useAppStore, selectUser, state, expectedUser);
```

### Database Test Utils

Mock database utilities are in `apps/web/src/test-utils/database-test-utils.ts`:

```typescript
import {
  createMockPrismaClient,
  DatabaseTestData,
} from './database-test-utils';

const mockPrisma = createMockPrismaClient();
const testPaper = DatabaseTestData.createResearchPaper();
```

## Code Coverage

### Coverage Thresholds

Global coverage thresholds are set in `jest.config.ts`:

- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Critical files have higher thresholds:

- **Stores**: 90% coverage required
- **Lib utilities**: 85% coverage required

### Coverage Reports

Coverage reports are generated in multiple formats:

- **HTML**: Interactive coverage report at `coverage/html/index.html`
- **LCOV**: For CI integration at `coverage/lcov.info`
- **JSON**: Machine-readable format at `coverage/coverage-final.json`
- **Markdown**: Summary report at `coverage/REPORT.md`

### Viewing Coverage

1. Run tests with coverage: `pnpm test:coverage`
2. Open HTML report: `pnpm coverage:open`
3. Review uncovered lines and add tests

## CI/CD Integration

### GitHub Actions

Tests run automatically on:

- Push to main, dev, or feature branches
- Pull requests to main

The CI pipeline includes:

1. Unit tests on multiple Node versions
2. E2E tests on multiple browsers
3. Linting and type checking
4. Coverage reporting to Codecov

### Pre-commit Hooks

Tests can be run before commits using Husky:

```bash
# In .husky/pre-commit
pnpm test:affected
```

## Best Practices

### 1. Test Organization

- Keep tests close to the code they test
- Use descriptive test names
- Group related tests with `describe` blocks
- Use `beforeEach` for common setup

### 2. Test Data

- Use factories for consistent test data
- Avoid hardcoded values
- Use faker for realistic test data
- Clean up after tests

### 3. Mocking

- Mock external dependencies
- Use MSW for API mocking
- Mock timers when testing time-dependent code
- Verify mock calls

### 4. Assertions

- Test behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Wait for async operations
- Test error states

### 5. Performance

- Keep tests fast and focused
- Avoid unnecessary waits
- Use parallel test execution
- Mock heavy operations

## Debugging Tests

### Debug Unit Tests

```bash
# Run tests in debug mode
node --inspect-brk ./node_modules/.bin/jest --runInBand

# Use console.log in tests
console.log(screen.debug());
```

### Debug E2E Tests

```bash
# Run with headed browser
pnpm test:e2e:headed

# Use Playwright Inspector
PWDEBUG=1 pnpm test:e2e

# Take screenshots on failure
await page.screenshot({ path: 'debug.png' });
```

### Common Issues

1. **Async Issues**: Use `waitFor` or `findBy` queries
2. **State Pollution**: Reset stores between tests
3. **Flaky Tests**: Avoid arbitrary timeouts, use proper waits
4. **Mock Leaks**: Clear mocks in `afterEach`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
