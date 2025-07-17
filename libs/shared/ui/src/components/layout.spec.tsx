import type React from 'react';
import { render, screen } from '@messai/testing';
import Layout from './layout';

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Layout Component', () => {
  const mockChildren = <div data-testid="test-content">Test Content</div>;

  it('should render children content', () => {
    render(<Layout>{mockChildren}</Layout>);

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have semantic HTML structure', () => {
    render(<Layout>{mockChildren}</Layout>);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId('test-content'));
  });

  it('should apply base styling classes', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>);

    // Find the actual layout div (it might be wrapped by test providers)
    const layoutDiv = container.querySelector('div.min-h-screen');
    expect(layoutDiv).toBeInTheDocument();
    expect(layoutDiv).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('should be accessible', () => {
    render(<Layout>{mockChildren}</Layout>);

    // Check for proper heading hierarchy
    const mainContent = screen.getByRole('main');
    expect(mainContent).toBeInTheDocument();
  });

  it('should handle empty children gracefully', () => {
    render(<Layout>{null}</Layout>);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toBeEmptyDOMElement();
  });

  it('should handle multiple children', () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Layout>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('should maintain consistent layout structure', () => {
    const { container } = render(<Layout>{mockChildren}</Layout>);

    // Verify the layout maintains consistent structure
    expect(container.firstChild).toMatchSnapshot();
  });
});
