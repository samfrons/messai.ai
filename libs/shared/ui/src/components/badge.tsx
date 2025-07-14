import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge color variant
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  /**
   * Badge size variant
   */
  size?: 'sm' | 'base' | 'lg';
  /**
   * Whether the badge should have a dot indicator
   */
  dot?: boolean;
}

const badgeVariants = {
  variant: {
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  size: {
    sm: 'px-2 py-0.5 text-xs',
    base: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  },
  dot: {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    gray: 'bg-gray-500',
  },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'gray', size = 'base', dot = false, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5 rounded-full border font-medium',

          // Variant styles
          badgeVariants.variant[variant],

          // Size styles
          badgeVariants.size[size],

          className
        )}
        {...props}
      >
        {dot && <span className={cn('h-1.5 w-1.5 rounded-full', badgeVariants.dot[variant])} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
