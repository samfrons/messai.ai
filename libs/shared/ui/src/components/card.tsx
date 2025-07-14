import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card padding variant
   */
  padding?: 'sm' | 'base' | 'lg' | 'none';
  /**
   * Whether the card should have a shadow
   */
  shadow?: 'none' | 'sm' | 'base' | 'md' | 'lg';
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
    sm: 'p-4',
    base: 'p-6',
    lg: 'p-8',
  },
  shadow: {
    none: '',
    sm: 'shadow-sm',
    base: 'shadow',
    md: 'shadow-md',
    lg: 'shadow-lg',
  },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'base',
      shadow = 'base',
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
          // Base styles
          'rounded-lg bg-white',

          // Padding variants
          cardVariants.padding[padding],

          // Shadow variants
          cardVariants.shadow[shadow],

          // Border
          {
            'border border-gray-200': border,
          },

          // Interactive states
          {
            'transition-shadow duration-200 hover:shadow-md cursor-pointer': interactive,
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
          'px-6 py-4',
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
      <div ref={ref} className={cn('px-6 py-4', className)} {...props}>
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
          'px-6 py-4',
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
