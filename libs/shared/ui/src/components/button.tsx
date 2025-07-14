import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn, type Size } from '../utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button size variant
   */
  size?: Size;
  /**
   * Button style variant - minimalist approach
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  /**
   * Whether the button should take full width
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon to display before text
   */
  icon?: React.ReactNode;
  /**
   * Icon to display after text
   */
  iconAfter?: React.ReactNode;
}

const buttonVariants = {
  variant: {
    primary: 'border border-black bg-black text-cream hover:bg-cream hover:text-black',
    secondary: 'border border-black bg-cream text-black hover:bg-black hover:text-cream',
    ghost: 'border-none bg-transparent text-black hover:opacity-60',
    outline: 'border border-gray-300 bg-transparent text-black hover:border-black hover:bg-gray-50',
    danger: 'border border-red-600 bg-red-600 text-white hover:bg-red-700 hover:border-red-700',
  },
  size: {
    sm: 'h-9 px-4 text-sm',
    base: 'h-11 px-6 text-sm',
    lg: 'h-12 px-8 text-base',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = 'base',
      variant = 'secondary',
      fullWidth = false,
      loading = false,
      disabled,
      icon,
      iconAfter,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles - minimalist approach
          'inline-flex items-center justify-center gap-2',
          'font-normal tracking-wide',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-cream',

          // Size variants
          buttonVariants.size[size],

          // Style variants
          buttonVariants.variant[variant],

          // States
          {
            'w-full': fullWidth,
            'opacity-40 cursor-not-allowed': isDisabled,
            'cursor-pointer': !isDisabled,
          },

          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
        {children && <span>{children}</span>}
        {!loading && iconAfter && <span className="flex-shrink-0">{iconAfter}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
