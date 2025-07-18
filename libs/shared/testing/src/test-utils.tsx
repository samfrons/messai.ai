import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { type NextRouter } from 'next/router';

// Mock Next.js router
const mockRouter: Partial<NextRouter> = {
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  back: jest.fn(),
  beforePopState: jest.fn(),
  prefetch: jest.fn(),
  push: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  defaultLocale: 'en',
  domainLocales: [],
  isPreview: false,
};

// Test providers wrapper
interface TestProvidersProps {
  children: React.ReactNode;
  router?: Partial<NextRouter> | undefined;
}

const TestProviders = ({ children, router: _ = {} }: TestProvidersProps) => {
  // Mock router implementation

  return <div data-testid="test-wrapper">{children}</div>;
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<NextRouter> | undefined;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): ReturnType<typeof render> => {
  const { router, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders router={router}>{children}</TestProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Test helpers
export const createMockNextRouter = (overrides: Partial<NextRouter> = {}): NextRouter =>
  ({
    ...mockRouter,
    ...overrides,
  }) as NextRouter;

export const waitForLoadingToFinish = () => new Promise((resolve) => setTimeout(resolve, 0));

export const createMockEvent = <T extends Event>(type: string, properties: Partial<T> = {}): T => {
  const event = new Event(type) as T;
  Object.assign(event, properties);
  return event;
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

// Common test utilities
export const mockConsole = () => {
  const originalConsole = { ...console };

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  return originalConsole;
};

export const createComponentTest = (
  component: ReactElement,
  testName: string,
  testFn: () => void
) => {
  describe(testName, () => {
    beforeEach(() => {
      customRender(component);
    });

    it(testName, testFn);
  });
};
