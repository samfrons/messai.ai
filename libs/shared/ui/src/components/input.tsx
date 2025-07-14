import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn, type Size } from '../utils';

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
    sm: 'h-9 text-sm',
    base: 'h-11 text-sm',
    lg: 'h-12 text-base',
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
    const hasError = error || !!errorMessage;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-normal text-black mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{icon}</span>
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              // Base styles - minimalist approach
              'block w-full bg-transparent',
              'border-b border-gray-300',
              'px-0 py-3',
              'placeholder-gray-500',
              'transition-colors duration-300',
              'focus:outline-none focus:border-black',

              // Size variants
              inputVariants.size[size],

              // Icon padding
              {
                'pl-10': icon,
                'pr-10': iconAfter,
              },

              // States
              {
                'text-black': !hasError && !disabled,
                'border-red-500 text-red-900 placeholder-red-400': hasError && !disabled,
                'text-gray-400 cursor-not-allowed opacity-50': disabled,
              },

              className
            )}
            {...props}
          />

          {iconAfter && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{iconAfter}</span>
            </div>
          )}
        </div>

        {(helperText || errorMessage) && (
          <p className={cn('mt-2 text-sm', hasError ? 'text-red-500' : 'text-gray-500')}>
            {errorMessage || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
