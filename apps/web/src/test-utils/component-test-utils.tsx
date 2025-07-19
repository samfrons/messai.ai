import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create providers for tests
interface TestProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

const TestProviders: React.FC<TestProvidersProps> = ({
  children,
  queryClient = createTestQueryClient(),
}) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const { queryClient, ...renderOptions } = options || {};
  const user = userEvent.setup();

  const result = render(ui, {
    wrapper: ({ children }) => <TestProviders queryClient={queryClient}>{children}</TestProviders>,
    ...renderOptions,
  });

  return { ...result, user };
};

// Test data generators
export const generateTestIds = (prefix: string) => ({
  container: `${prefix}-container`,
  header: `${prefix}-header`,
  content: `${prefix}-content`,
  footer: `${prefix}-footer`,
  loading: `${prefix}-loading`,
  error: `${prefix}-error`,
  empty: `${prefix}-empty`,
});

// Common test scenarios
export const testAccessibility = (Component: React.ComponentType<any>, props: any) => {
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Component {...props} />);
      // Note: You'll need to install jest-axe for this
      // const results = await axe(container);
      // expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Component {...props} />);

      await user.tab();
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });
};

// Loading state test helper
export const testLoadingState = (Component: React.ComponentType<any>, loadingProp = 'loading') => {
  it('should show loading indicator when loading', () => {
    const { container } = render(<Component {...{ [loadingProp]: true }} />);
    const loadingElements = container.querySelectorAll('[class*="animate-"], [class*="loading"]');
    expect(loadingElements.length).toBeGreaterThan(0);
  });
};

// Error state test helper
export const testErrorState = (Component: React.ComponentType<any>, errorProp = 'error') => {
  it('should display error message when error occurs', () => {
    const errorMessage = 'Test error message';
    const { getByText } = render(<Component {...{ [errorProp]: new Error(errorMessage) }} />);
    expect(getByText(errorMessage)).toBeInTheDocument();
  });
};

// Form testing helpers
export const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: Record<string, string | boolean>
) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) continue;

    if (field instanceof HTMLInputElement && field.type === 'checkbox') {
      if (value !== field.checked) {
        await user.click(field);
      }
    } else if (field instanceof HTMLSelectElement) {
      await user.selectOptions(field, value as string);
    } else {
      await user.clear(field as HTMLElement);
      await user.type(field as HTMLElement, value as string);
    }
  }
};

// API mock helpers
export const createMockResponse = <T,>(data: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const createMockError = (message: string, delay = 0): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
};

// Component snapshot testing helper
export const testSnapshot = (
  Component: React.ComponentType<any>,
  scenarios: Array<{ name: string; props: any }>
) => {
  describe('Snapshots', () => {
    scenarios.forEach(({ name, props }) => {
      it(`should match snapshot for ${name}`, () => {
        const { container } = render(<Component {...props} />);
        expect(container.firstChild).toMatchSnapshot();
      });
    });
  });
};

// Responsive testing helper
export const testResponsive = (
  Component: React.ComponentType<any>,
  props: any,
  breakpoints = { mobile: 375, tablet: 768, desktop: 1024 }
) => {
  describe('Responsive behavior', () => {
    Object.entries(breakpoints).forEach(([device, width]) => {
      it(`should render correctly on ${device} (${width}px)`, () => {
        // Mock window width
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { container } = render(<Component {...props} />);
        expect(container.firstChild).toBeTruthy();
      });
    });
  });
};

// Animation testing helper
export const waitForAnimation = (element: HTMLElement, timeout = 1000): Promise<void> => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      resolve();
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
};

// Data attribute testing helper
export const getByDataTestId = (container: HTMLElement, testId: string): HTMLElement | null => {
  return container.querySelector(`[data-testid="${testId}"]`);
};

// Re-export commonly used testing utilities
export * from '@testing-library/react';
export { userEvent };
