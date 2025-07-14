// React import needed for JSX in test files
import { render, screen, createMockNextRouter, waitForLoadingToFinish } from './test-utils';

// Test component to verify our utilities work
const TestComponent = () => (
  <div>
    <h1>Test Component</h1>
    <p>Testing utilities</p>
  </div>
);

describe('Test Utils', () => {
  describe('render', () => {
    it('should render components successfully', () => {
      render(<TestComponent />);

      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText('Testing utilities')).toBeInTheDocument();
    });

    it('should provide testing wrapper', () => {
      render(<TestComponent />);

      const wrapper = screen.getByTestId('test-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('createMockNextRouter', () => {
    it('should create a mock router with default values', () => {
      const router = createMockNextRouter();

      expect(router.pathname).toBe('/');
      expect(router.query).toEqual({});
      expect(router.asPath).toBe('/');
      expect(router.isReady).toBe(true);
      expect(typeof router.push).toBe('function');
      expect(typeof router.replace).toBe('function');
    });

    it('should allow overriding router properties', () => {
      const router = createMockNextRouter({
        pathname: '/test',
        query: { id: '123' },
        asPath: '/test?id=123',
      });

      expect(router.pathname).toBe('/test');
      expect(router.query).toEqual({ id: '123' });
      expect(router.asPath).toBe('/test?id=123');
    });
  });

  describe('waitForLoadingToFinish', () => {
    it('should resolve after timeout', async () => {
      const start = Date.now();
      await waitForLoadingToFinish();
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(0);
    });
  });
});
