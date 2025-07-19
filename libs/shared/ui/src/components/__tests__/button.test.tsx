import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies default variant and size classes', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');

    // Default variant is 'secondary'
    expect(button).toHaveClass('border-black', 'bg-cream', 'text-black');
    // Default size is 'base'
    expect(button).toHaveClass('h-11', 'px-8', 'text-sm');
  });

  describe('Variants', () => {
    it('applies primary variant classes', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-black', 'text-cream');
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-cream', 'text-black');
    });

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-none', 'bg-transparent');
    });

    it('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-gray-300', 'bg-transparent');
    });

    it('applies danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-red-600', 'bg-red-600', 'text-white');
    });
  });

  describe('Sizes', () => {
    it('applies small size classes', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-5', 'text-sm');
    });

    it('applies base size classes', () => {
      render(<Button size="base">Base</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-11', 'px-8', 'text-sm');
    });

    it('applies large size classes', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'px-10', 'text-base');
    });
  });

  describe('States', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-40', 'cursor-not-allowed');
    });

    it('handles loading state', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-40', 'cursor-not-allowed');

      // Check for spinner
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when loading is true', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading Button
        </Button>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Props', () => {
    it('applies fullWidth class when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('renders with icon before text', () => {
      const TestIcon = () => <span data-testid="test-icon">→</span>;
      render(<Button icon={<TestIcon />}>With Icon</Button>);

      const icon = screen.getByTestId('test-icon');
      const text = screen.getByText('With Icon');

      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('flex-shrink-0');
      // Icon should come before text
      expect(icon.compareDocumentPosition(text)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('renders with icon after text', () => {
      const TestIcon = () => <span data-testid="test-icon">→</span>;
      render(<Button iconAfter={<TestIcon />}>With Icon After</Button>);

      const icon = screen.getByTestId('test-icon');
      const text = screen.getByText('With Icon After');

      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('flex-shrink-0');
      // Icon should come after text
      expect(text.compareDocumentPosition(icon)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('hides icons when loading', () => {
      const TestIcon = () => <span data-testid="test-icon">→</span>;
      render(
        <Button loading icon={<TestIcon />} iconAfter={<TestIcon />}>
          Loading
        </Button>
      );

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>With Ref</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('With Ref');
    });

    it('passes through HTML button props', () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} type="submit" form="test-form" aria-label="Custom label">
          Submit
        </Button>
      );

      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Keyboard</Button>);
      const button = screen.getByRole('button');

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' '); // Space key
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Button disabled loading>
          Accessible Button
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('maintains focus styles', () => {
      render(<Button>Focus Test</Button>);
      const button = screen.getByRole('button');

      expect(button).toHaveClass(
        'focus:outline-none',
        'focus-visible:ring-1',
        'focus-visible:ring-black'
      );
    });

    it('provides semantic button role', () => {
      render(<Button>Semantic</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders without children', () => {
      render(<Button />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles both icon and loading state', () => {
      const TestIcon = () => <span data-testid="icon">Icon</span>;
      render(
        <Button loading icon={<TestIcon />}>
          Loading with Icon
        </Button>
      );

      // Should show spinner, not icon
      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    it('handles rapid state changes', () => {
      const { rerender } = render(<Button>Dynamic</Button>);
      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();

      rerender(<Button disabled>Dynamic</Button>);
      expect(button).toBeDisabled();

      rerender(<Button loading>Dynamic</Button>);
      expect(button).toBeDisabled();
      expect(button.querySelector('svg')).toBeInTheDocument();

      rerender(<Button>Dynamic</Button>);
      expect(button).not.toBeDisabled();
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });
  });
});
