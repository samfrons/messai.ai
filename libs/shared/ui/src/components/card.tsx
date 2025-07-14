import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card padding variant
   */
  padding?: 'sm' | 'base' | 'lg' | 'none';
  /**
   * Whether the card should have a shadow - minimalist approach uses none
   */
  shadow?: boolean;
  /**
   * Whether the card should have a border
   */
  border?: boolean;
  /**
   * Whether the card is interactive (hover effects)
   */
  interactive?: boolean;
}

const cardVariants = {
  padding: {
    none: '',
    sm: 'p-6',
    base: 'p-8',
    lg: 'p-10',
  },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'base',
      shadow = false,
      border = true,
      interactive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles - minimalist approach
          'bg-white',

          // Padding variants
          cardVariants.padding[padding],

          // Border - thin and subtle
          {
            'border border-gray-200': border,
          },

          // Shadow - minimal or none
          {
            'shadow-sm': shadow,
          },

          // Interactive states - subtle
          {
            'transition-all duration-300 hover:border-gray-300': interactive && border,
            'cursor-pointer': interactive,
          },

          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to include a bottom border
   */
  border?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ border = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-8 py-6',
          {
            'border-b border-gray-200': border,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('px-8 py-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to include a top border
   */
  border?: boolean;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ border = true, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-8 py-6',
          {
            'border-t border-gray-200': border,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';
