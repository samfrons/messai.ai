// React import needed for JSX in test files
import { render, screen } from '@messai/testing';
import Page from './page';

describe('Home Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });

  it('should contain welcome message', () => {
    render(<Page />);

    // Look for the welcome text that E2E test expects
    const welcomeElement = screen.getByRole('heading', { level: 1 });
    expect(welcomeElement).toBeInTheDocument();
    expect(welcomeElement.textContent).toContain('Welcome');
  });

  it('should have proper page structure', () => {
    render(<Page />);

    // Check for main content wrapper
    const wrapper = screen.getByTestId('test-wrapper');
    expect(wrapper).toBeInTheDocument();

    // Check for container div
    const container = wrapper.querySelector('.container');
    expect(container).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<Page />);

    // Check for proper heading hierarchy
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<Page />);

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should match snapshot', () => {
    const { container } = render(<Page />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
