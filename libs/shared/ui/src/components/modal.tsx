'use client';

import { forwardRef, useEffect, type HTMLAttributes } from 'react';
import { cn, focusRing } from '../utils';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Function to call when the modal should close
   */
  onClose: () => void;
  /**
   * Modal size variant
   */
  size?: 'sm' | 'base' | 'lg' | 'xl' | 'full';
  /**
   * Whether clicking the backdrop should close the modal
   */
  closeOnBackdrop?: boolean;
  /**
   * Whether pressing Escape should close the modal
   */
  closeOnEscape?: boolean;
  /**
   * Modal title for accessibility
   */
  title?: string;
}

const modalVariants = {
  size: {
    sm: 'max-w-sm',
    base: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-7xl mx-4',
  },
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      size = 'base',
      closeOnBackdrop = true,
      closeOnEscape = true,
      title,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [open]);

    if (!open) return null;

    const handleBackdropClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnBackdrop) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 transition-opacity" />

        {/* Modal */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            // Base styles
            'relative w-full bg-white rounded-lg shadow-xl',
            'transform transition-all duration-200',
            'max-h-[90vh] overflow-y-auto',

            // Size variants
            modalVariants.size[size],

            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

// Modal sub-components
export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the close button
   */
  showClose?: boolean;
  /**
   * Function to call when close button is clicked
   */
  onClose?: () => void;
}

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ showClose = true, onClose, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between p-6 border-b border-gray-200', className)}
        {...props}
      >
        <div className="text-lg font-semibold text-gray-900">{children}</div>
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'rounded-md text-gray-400 hover:text-gray-600',
              'transition-colors duration-200',
              focusRing
            )}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6', className)} {...props}>
        {children}
      </div>
    );
  }
);

ModalContent.displayName = 'ModalContent';

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-end gap-3 p-6 border-t border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';
