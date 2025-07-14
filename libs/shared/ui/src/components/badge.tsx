import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge style variant - minimalist approach
   */
  variant?: 'default' | 'outline' | 'ghost';
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
    default: 'bg-gray-100 text-black border-gray-200',
    outline: 'bg-transparent text-black border-black',
    ghost: 'bg-transparent text-gray-600 border-transparent',
  },
  size: {
    sm: 'px-2 py-0.5 text-xs',
    base: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm',
  },
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'base', dot = false, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles - minimalist approach
          'inline-flex items-center gap-1.5',
          'font-normal tracking-wide',
          'border',
          'transition-all duration-300',

          // Variant styles
          badgeVariants.variant[variant],

          // Size styles
          badgeVariants.size[size],

          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              variant === 'outline' ? 'bg-black' : 'bg-gray-400'
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
