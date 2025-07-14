'use client';

import { forwardRef, type HTMLAttributes, useState } from 'react';
import { cn } from '../utils';
import { Badge } from './badge';
import { Button } from './button';
import { Input } from './input';

/**
 * Filter configuration types (re-export from research types)
 */
export interface SearchFilters {
  yearRange?: { start: number; end: number };
  journalTypes?: string[];
  researchFocus?: string[];
  minCitations?: number;
  minConfidenceScore?: number;
  minQualityScore?: number;
  hasPerformanceMetrics?: boolean;
  aiEnhancedOnly?: boolean;
  fullTextOnly?: boolean;
}

export interface SearchFiltersProps extends HTMLAttributes<HTMLDivElement> {
  /** Current filter state */
  filters: SearchFilters;

  /** Callback when filters change */
  onFiltersChange: (filters: SearchFilters) => void;

  /** Whether to show advanced filters */
  showAdvanced?: boolean;

  /** Available journal types */
  journalTypes?: string[];

  /** Available research focus options */
  researchFocusOptions?: string[];

  /** Whether filters are collapsible */
  collapsible?: boolean;

  /** Whether to show filter count */
  showFilterCount?: boolean;
}

/**
 * SearchFilters - Advanced filtering component for research papers
 *
 * Features:
 * - Year range filtering with slider or input
 * - Multi-select journal types
 * - Multi-select research focus areas
 * - Numeric filters for citations, quality, confidence
 * - Boolean filters for special criteria
 * - Active filter badges
 * - Clear all functionality
 * - Collapsible sections
 */
export const SearchFilters = forwardRef<HTMLDivElement, SearchFiltersProps>(
  (
    {
      filters,
      onFiltersChange,
      showAdvanced = true,
      journalTypes = [
        'Energy',
        'Biotechnology',
        'Materials',
        'Environmental',
        'Engineering',
        'Biochemistry',
        'Sustainability',
        'Electrochemistry',
      ],
      researchFocusOptions = [
        'MFC',
        'MEC',
        'MDC',
        'PEM',
        'SOFC',
        'PAFC',
        'Electrode Design',
        'Biofilm Engineering',
        'Performance Optimization',
        'Materials Science',
        'Systems Integration',
        'Economic Analysis',
        'Environmental Impact',
      ],
      collapsible = true,
      showFilterCount = true,
      className,
      ...props
    },
    ref
  ) => {
    const [isExpanded, setIsExpanded] = useState(!collapsible);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Count active filters
    const activeFilterCount = Object.keys(filters).filter((key) => {
      const value = filters[key as keyof SearchFilters];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return true;
      return value !== undefined && value !== null;
    }).length;

    const clearFilters = () => {
      onFiltersChange({});
    };

    const toggleJournalType = (type: string) => {
      const current = filters.journalTypes || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      const newFilters = { ...filters };
      if (updated.length > 0) {
        newFilters.journalTypes = updated;
      } else {
        delete newFilters.journalTypes;
      }
      onFiltersChange(newFilters);
    };

    const toggleResearchFocus = (focus: string) => {
      const current = filters.researchFocus || [];
      const updated = current.includes(focus)
        ? current.filter((f) => f !== focus)
        : [...current, focus];
      const newFilters = { ...filters };
      if (updated.length > 0) {
        newFilters.researchFocus = updated;
      } else {
        delete newFilters.researchFocus;
      }
      onFiltersChange(newFilters);
    };

    const setYearRange = (start: number, end: number) => {
      if (start <= end) {
        onFiltersChange({ ...filters, yearRange: { start, end } });
      }
    };

    const currentYear = new Date().getFullYear();

    return (
      <div
        ref={ref}
        className={cn('bg-white border border-gray-200 rounded-lg', className)}
        {...props}
      >
        {/* Filter Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            {showFilterCount && activeFilterCount > 0 && (
              <Badge variant="primary" size="sm">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Content */}
        {isExpanded && (
          <div className="p-4 space-y-6">
            {/* Year Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Year
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="From"
                  value={filters.yearRange?.start || ''}
                  onChange={(e) => {
                    const start = parseInt(e.target.value) || 2000;
                    const end = filters.yearRange?.end || currentYear;
                    setYearRange(start, end);
                  }}
                  min={2000}
                  max={currentYear}
                />
                <Input
                  type="number"
                  placeholder="To"
                  value={filters.yearRange?.end || ''}
                  onChange={(e) => {
                    const end = parseInt(e.target.value) || currentYear;
                    const start = filters.yearRange?.start || 2000;
                    setYearRange(start, end);
                  }}
                  min={2000}
                  max={currentYear}
                />
              </div>
            </div>

            {/* Journal Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Journal Type</label>
              <div className="flex flex-wrap gap-2">
                {journalTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleJournalType(type)}
                    className={cn(
                      'px-3 py-1 rounded-full border text-sm font-medium transition-colors',
                      filters.journalTypes?.includes(type)
                        ? 'bg-primary-100 border-primary-300 text-primary-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Research Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Focus</label>
              <div className="flex flex-wrap gap-2">
                {researchFocusOptions.slice(0, 8).map((focus) => (
                  <button
                    key={focus}
                    onClick={() => toggleResearchFocus(focus)}
                    className={cn(
                      'px-3 py-1 rounded-full border text-sm font-medium transition-colors',
                      filters.researchFocus?.includes(focus)
                        ? 'bg-secondary-100 border-secondary-300 text-secondary-800'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {focus}
                  </button>
                ))}
                {researchFocusOptions.length > 8 && (
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="px-3 py-1 rounded-full border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    {showAdvancedFilters ? 'Show Less' : `+${researchFocusOptions.length - 8} More`}
                  </button>
                )}
              </div>

              {showAdvancedFilters && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
                  {researchFocusOptions.slice(8).map((focus) => (
                    <button
                      key={focus}
                      onClick={() => toggleResearchFocus(focus)}
                      className={cn(
                        'px-3 py-1 rounded-full border text-sm font-medium transition-colors',
                        filters.researchFocus?.includes(focus)
                          ? 'bg-secondary-100 border-secondary-300 text-secondary-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {focus}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Numeric Filters */}
            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700">Advanced Filters</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Min Citations
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minCitations || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || undefined;
                        const newFilters = { ...filters };
                        if (value) {
                          newFilters.minCitations = value;
                        } else {
                          delete newFilters.minCitations;
                        }
                        onFiltersChange(newFilters);
                      }}
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Min Quality Score
                    </label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      step="0.1"
                      value={filters.minQualityScore || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || undefined;
                        const newFilters = { ...filters };
                        if (value) {
                          newFilters.minQualityScore = value;
                        } else {
                          delete newFilters.minQualityScore;
                        }
                        onFiltersChange(newFilters);
                      }}
                      min={0}
                      max={10}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Min AI Confidence
                    </label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      step="0.1"
                      value={filters.minConfidenceScore || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || undefined;
                        const newFilters = { ...filters };
                        if (value) {
                          newFilters.minConfidenceScore = value;
                        } else {
                          delete newFilters.minConfidenceScore;
                        }
                        onFiltersChange(newFilters);
                      }}
                      min={0}
                      max={1}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Boolean Filters */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.hasPerformanceMetrics || false}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.checked) {
                      newFilters.hasPerformanceMetrics = true;
                    } else {
                      delete newFilters.hasPerformanceMetrics;
                    }
                    onFiltersChange(newFilters);
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Has performance metrics</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.aiEnhancedOnly || false}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.checked) {
                      newFilters.aiEnhancedOnly = true;
                    } else {
                      delete newFilters.aiEnhancedOnly;
                    }
                    onFiltersChange(newFilters);
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">AI-enhanced papers only</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={filters.fullTextOnly || false}
                  onChange={(e) => {
                    const newFilters = { ...filters };
                    if (e.target.checked) {
                      newFilters.fullTextOnly = true;
                    } else {
                      delete newFilters.fullTextOnly;
                    }
                    onFiltersChange(newFilters);
                  }}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Full text available</span>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchFilters.displayName = 'SearchFilters';

/**
 * ActiveFilterTags - Display active filters as removable badges
 */
export interface ActiveFilterTagsProps extends HTMLAttributes<HTMLDivElement> {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearAll?: () => void;
}

export const ActiveFilterTags = forwardRef<HTMLDivElement, ActiveFilterTagsProps>(
  ({ filters, onFiltersChange, onClearAll, className, ...props }, ref) => {
    const removeFilter = (filterType: keyof SearchFilters, value?: string) => {
      const updated = { ...filters };

      if (filterType === 'journalTypes' && value) {
        const current = filters.journalTypes || [];
        const newTypes = current.filter((t) => t !== value);
        if (newTypes.length > 0) {
          updated.journalTypes = newTypes;
        } else {
          delete updated.journalTypes;
        }
      } else if (filterType === 'researchFocus' && value) {
        const current = filters.researchFocus || [];
        const newFocus = current.filter((f) => f !== value);
        if (newFocus.length > 0) {
          updated.researchFocus = newFocus;
        } else {
          delete updated.researchFocus;
        }
      } else {
        delete updated[filterType];
      }

      onFiltersChange(updated);
    };

    const filterTags = [];

    // Year range
    if (filters.yearRange) {
      filterTags.push(
        <Badge
          key="year-range"
          variant="secondary"
          className="cursor-pointer"
          onClick={() => removeFilter('yearRange')}
        >
          {filters.yearRange.start} - {filters.yearRange.end}
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Badge>
      );
    }

    // Journal types
    filters.journalTypes?.forEach((type) => {
      filterTags.push(
        <Badge
          key={`journal-${type}`}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => removeFilter('journalTypes', type)}
        >
          {type}
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Badge>
      );
    });

    // Research focus
    filters.researchFocus?.forEach((focus) => {
      filterTags.push(
        <Badge
          key={`focus-${focus}`}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => removeFilter('researchFocus', focus)}
        >
          {focus}
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Badge>
      );
    });

    // Numeric filters
    if (filters.minCitations) {
      filterTags.push(
        <Badge
          key="min-citations"
          variant="secondary"
          className="cursor-pointer"
          onClick={() => removeFilter('minCitations')}
        >
          Citations ≥ {filters.minCitations}
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Badge>
      );
    }

    // Boolean filters
    if (filters.hasPerformanceMetrics) {
      filterTags.push(
        <Badge
          key="has-metrics"
          variant="secondary"
          className="cursor-pointer"
          onClick={() => removeFilter('hasPerformanceMetrics')}
        >
          Has Metrics
          <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Badge>
      );
    }

    if (filterTags.length === 0) return null;

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-2', className)} {...props}>
        <span className="text-sm text-gray-600">Active filters:</span>
        {filterTags}
        {onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            Clear all
          </Button>
        )}
      </div>
    );
  }
);

ActiveFilterTags.displayName = 'ActiveFilterTags';
