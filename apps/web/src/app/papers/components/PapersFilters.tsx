'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

interface FiltersProps {
  initialFilters: {
    yearStart?: string;
    yearEnd?: string;
    verified?: boolean;
  };
}

export default function PapersFilters({ initialFilters }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    yearStart: initialFilters.yearStart || '',
    yearEnd: initialFilters.yearEnd || '',
    verified: initialFilters.verified || false,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update year filters
    if (filters.yearStart) {
      params.set('yearStart', filters.yearStart);
    } else {
      params.delete('yearStart');
    }

    if (filters.yearEnd) {
      params.set('yearEnd', filters.yearEnd);
    } else {
      params.delete('yearEnd');
    }

    // Update verified filter
    if (filters.verified) {
      params.set('verified', 'true');
    } else {
      params.delete('verified');
    }

    // Reset to first page
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setFilters({
      yearStart: '',
      yearEnd: '',
      verified: false,
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete('yearStart');
    params.delete('yearEnd');
    params.delete('verified');
    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const activeFiltersCount = [filters.yearStart, filters.yearEnd, filters.verified].filter(
    Boolean
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Year range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="From"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.yearStart}
                  onChange={(e) => setFilters({ ...filters, yearStart: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="To"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.yearEnd}
                  onChange={(e) => setFilters({ ...filters, yearEnd: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Verified only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Verified papers only</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isPending ? 'Applying...' : 'Apply Filters'}
              </button>
              <button
                onClick={clearFilters}
                disabled={isPending}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
