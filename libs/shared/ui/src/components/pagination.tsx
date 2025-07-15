'use client';

import { forwardRef, type HTMLAttributes, useState } from 'react';
import { cn } from '../utils';
import { Button } from './button';
import { Input } from './input';

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  /** Current page number (0-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Total number of items */
  totalItems: number;

  /** Number of items per page */
  itemsPerPage: number;

  /** Available items per page options */
  itemsPerPageOptions?: number[];

  /** Callback when page changes */
  onPageChange: (page: number) => void;

  /** Callback when items per page changes */
  onItemsPerPageChange: (itemsPerPage: number) => void;

  /** Loading state */
  isLoading?: boolean;

  /** Show items per page selector */
  showItemsPerPage?: boolean;

  /** Show page jump input */
  showPageJump?: boolean;

  /** Show result count */
  showResultCount?: boolean;

  /** Number of page buttons to show around current page */
  siblingCount?: number;

  /** Compact mode for mobile */
  compact?: boolean;
}

/**
 * Pagination component with advanced features
 *
 * Features:
 * - Previous/Next navigation
 * - Direct page selection with ellipsis
 * - Items per page selector
 * - Jump to page input
 * - Result count display
 * - Loading states
 * - Responsive design
 * - Keyboard navigation
 */
export const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      itemsPerPageOptions = [10, 25, 50, 100],
      onPageChange,
      onItemsPerPageChange,
      isLoading = false,
      showItemsPerPage = true,
      showPageJump = true,
      showResultCount = true,
      siblingCount = 1,
      compact = false,
      className,
      ...props
    },
    ref
  ) => {
    const [jumpToPage, setJumpToPage] = useState<string>('');
    const [isJumpInputFocused, setIsJumpInputFocused] = useState(false);

    // Calculate result range
    const startResult = currentPage * itemsPerPage + 1;
    const endResult = Math.min((currentPage + 1) * itemsPerPage, totalItems);

    // Generate page numbers to display
    const generatePageNumbers = () => {
      const pages: (number | 'ellipsis')[] = [];

      if (totalPages <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 0; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(0);

        // Calculate range around current page
        const leftSibling = Math.max(currentPage - siblingCount, 1);
        const rightSibling = Math.min(currentPage + siblingCount, totalPages - 2);

        // Add left ellipsis if needed
        if (leftSibling > 1) {
          pages.push('ellipsis');
        }

        // Add pages around current page
        for (let i = leftSibling; i <= rightSibling; i++) {
          pages.push(i);
        }

        // Add right ellipsis if needed
        if (rightSibling < totalPages - 2) {
          pages.push('ellipsis');
        }

        // Always show last page
        if (totalPages > 1) {
          pages.push(totalPages - 1);
        }
      }

      return pages;
    };

    const handleJumpToPage = () => {
      const pageNum = parseInt(jumpToPage) - 1; // Convert to 0-indexed
      if (pageNum >= 0 && pageNum < totalPages) {
        onPageChange(pageNum);
        setJumpToPage('');
        setIsJumpInputFocused(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleJumpToPage();
      } else if (e.key === 'Escape') {
        setJumpToPage('');
        setIsJumpInputFocused(false);
      }
    };

    if (totalPages <= 1) return null;

    const pageNumbers = generatePageNumbers();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6',
          compact && 'px-2 py-2',
          className
        )}
        {...props}
      >
        {/* Mobile view */}
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0 || isLoading}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            {showResultCount && (
              <span className="text-sm text-gray-700">
                {startResult}-{endResult} of {totalItems.toLocaleString()}
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || isLoading}
          >
            Next
          </Button>
        </div>

        {/* Desktop view */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          {/* Left side - Result count and items per page */}
          <div className="flex items-center space-x-6">
            {showResultCount && (
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startResult.toLocaleString()}</span> to{' '}
                  <span className="font-medium">{endResult.toLocaleString()}</span> of{' '}
                  <span className="font-medium">{totalItems.toLocaleString()}</span> results
                </p>
              </div>
            )}

            {showItemsPerPage && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                  disabled={isLoading}
                  className="border-gray-300 rounded-md text-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {itemsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">per page</span>
              </div>
            )}
          </div>

          {/* Right side - Navigation */}
          <div className="flex items-center space-x-4">
            {/* Jump to page */}
            {showPageJump && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Page</span>
                <div className="relative">
                  <Input
                    type="number"
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsJumpInputFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsJumpInputFocused(false), 100);
                    }}
                    placeholder={(currentPage + 1).toString()}
                    min={1}
                    max={totalPages}
                    disabled={isLoading}
                    className="w-16 text-center text-sm"
                  />
                  {isJumpInputFocused && jumpToPage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleJumpToPage}
                      className="absolute -right-12 top-0 h-full px-2"
                    >
                      Go
                    </Button>
                  )}
                </div>
                <span className="text-sm text-gray-700">of {totalPages}</span>
              </div>
            )}

            {/* Page navigation */}
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              {/* Previous button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0 || isLoading}
                className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>

              {/* Page numbers */}
              {pageNumbers.map((page, index) =>
                page === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    className={cn(
                      'relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0',
                      page === currentPage
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline-indigo-600'
                        : 'text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    {page + 1}
                  </Button>
                )
              )}

              {/* Next button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isLoading}
                className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </nav>
          </div>
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

/**
 * Simple pagination component for cases where only basic navigation is needed
 */
export interface SimplePaginationProps extends HTMLAttributes<HTMLDivElement> {
  /** Current page number (0-indexed) */
  currentPage: number;

  /** Total number of pages */
  totalPages: number;

  /** Callback when page changes */
  onPageChange: (page: number) => void;

  /** Loading state */
  isLoading?: boolean;
}

export const SimplePagination = forwardRef<HTMLDivElement, SimplePaginationProps>(
  ({ currentPage, totalPages, onPageChange, isLoading = false, className, ...props }, ref) => {
    if (totalPages <= 1) return null;

    return (
      <div ref={ref} className={cn('flex items-center justify-between', className)} {...props}>
        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          }
        >
          Previous
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
        </div>

        <Button
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || isLoading}
          iconAfter={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          }
        >
          Next
        </Button>
      </div>
    );
  }
);

SimplePagination.displayName = 'SimplePagination';
