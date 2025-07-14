import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn, type Size, focusRing, transition } from '../utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input size variant
   */
  size?: Size;
  /**
   * Whether the input has an error state
   */
  error?: boolean;
  /**
   * Icon to display before input
   */
  icon?: React.ReactNode;
  /**
   * Icon to display after input
   */
  iconAfter?: React.ReactNode;
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Helper text to display below input
   */
  helperText?: string;
  /**
   * Error message to display
   */
  errorMessage?: string;
}

const inputVariants = {
  size: {
    sm: 'h-8 px-3 text-sm',
    base: 'h-10 px-3 text-base',
    lg: 'h-12 px-4 text-lg',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'base',
      error = false,
      icon,
      iconAfter,
      label,
      helperText,
      errorMessage,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || !!errorMessage;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{icon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              // Base styles
              'block w-full rounded-md border shadow-sm',
              'placeholder-gray-400',
              transition,
              focusRing,

              // Size variants
              inputVariants.size[size],

              // Icon padding
              {
                'pl-10': icon,
                'pr-10': iconAfter,
              },

              // States
              {
                'border-gray-300 bg-white text-gray-900': !hasError && !disabled,
                'border-red-300 bg-red-50 text-red-900 placeholder-red-400': hasError,
                'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed': disabled,
              },

              className
            )}
            {...props}
          />

          {iconAfter && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 sm:text-sm">{iconAfter}</span>
            </div>
          )}
        </div>

        {(helperText || errorMessage) && (
          <p className={cn('mt-1 text-sm', hasError ? 'text-red-600' : 'text-gray-500')}>
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
