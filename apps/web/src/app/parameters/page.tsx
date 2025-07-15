'use client';

import { useState, useCallback } from 'react';
import { Button, Input, Badge } from '@messai/ui';
import ParameterList from './components/ParameterList';
import ParameterTableView from './components/ParameterTableView';
import ParameterCategoryView from './components/ParameterCategoryView';
import ParameterCompatibilityMatrix from './components/ParameterCompatibilityMatrix';
import ParameterFilters from './components/ParameterFilters';
import { useParameterSearch } from './hooks/useParameterSearch';
import { useParameterFilters } from './hooks/useParameterFilters';
import { MICROFLUIDIC_PARAMETERS } from './data/microfluidic-parameters';
import type { ParameterSortOption } from '../../types/parameters';

type ViewMode = 'grid' | 'table' | 'category' | 'compatibility';

export default function ParametersPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<ParameterSortOption>('name');

  const {
    query,
    filters,
    page,
    pageSize,
    isLoading,
    results,
    hasActiveFilters,
    totalResults,
    error,
    setQuery,
    setFilters,
    setPage,
    clearFilters,
  } = useParameterSearch();

  const {
    categoryOptions,
    subcategoryOptions,
    typeOptions,
    propertyRanges,
    compatibilityOptions,
    categories,
    updateFilter,
    clearCategoryFilter,
  } = useParameterFilters(filters, setFilters);

  const handleSearch = useCallback(() => {
    setQuery(searchInput);
    setPage(1);
  }, [searchInput, setQuery, setPage]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const currentPageStart = (page - 1) * pageSize + 1;
  const currentPageEnd = Math.min(page * pageSize, totalResults);

  // Merge microfluidic parameters with existing results
  const allParameters = [...(results || []), ...MICROFLUIDIC_PARAMETERS];
  const totalWithMicrofluidic = totalResults + MICROFLUIDIC_PARAMETERS.length;

  const getViewModeIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'grid':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
        );
      case 'table':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 6h18m-9 8h9m-9 4h9m-9-8h9m-9 4h9"
            />
          </svg>
        );
      case 'category':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14-2l-7 7-7-7"
            />
          </svg>
        );
      case 'compatibility':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderParameterView = () => {
    const commonProps = {
      parameters: allParameters,
      isLoading,
      error,
      onParameterSelect: (param: any) => console.log('Selected:', param),
    };

    switch (viewMode) {
      case 'table':
        return (
          <ParameterTableView
            {...commonProps}
            onSortChange={setSortOption}
            currentSort={sortOption}
          />
        );
      case 'category':
        return <ParameterCategoryView {...commonProps} />;
      case 'compatibility':
        return <ParameterCompatibilityMatrix {...commonProps} />;
      case 'grid':
      default:
        return <ParameterList {...commonProps} parameters={results || []} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MESS Parameters</h1>
            <p className="text-gray-600 mt-2">
              Browse and manage parameters from the comprehensive MESSAI library for microbial
              electrochemical systems
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{totalWithMicrofluidic}</div>
            <div className="text-sm text-gray-600">Total Parameters</div>
            <div className="text-xs text-gray-500 mt-1">
              {MICROFLUIDIC_PARAMETERS.length} microfluidic parameters
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Search parameters..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            {[
              { mode: 'grid' as ViewMode, label: 'Grid', tooltip: 'Card grid view' },
              { mode: 'table' as ViewMode, label: 'Table', tooltip: 'Table list view' },
              { mode: 'category' as ViewMode, label: 'Category', tooltip: 'Category groups' },
              {
                mode: 'compatibility' as ViewMode,
                label: 'Matrix',
                tooltip: 'Compatibility matrix',
              },
            ].map((view) => (
              <Button
                key={view.mode}
                variant={viewMode === view.mode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(view.mode)}
                className="rounded-none flex items-center gap-2"
                title={view.tooltip}
              >
                {getViewModeIcon(view.mode)}
                <span className="hidden sm:inline">{view.label}</span>
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-gray-100' : ''}
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {hasActiveFilters && (
              <Badge variant="primary" className="ml-2">
                Active
              </Badge>
            )}
          </Button>
          <Button variant="outline">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Parameter
          </Button>
          <Button variant="outline">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Import
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category}
              <button onClick={() => clearCategoryFilter()} className="ml-1 hover:text-gray-700">
                ×
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type}
              <button
                onClick={() => updateFilter('type', null)}
                className="ml-1 hover:text-gray-700"
              >
                ×
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600">
            Clear all
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && viewMode !== 'compatibility' && (
          <div className="w-64 flex-shrink-0">
            <ParameterFilters
              filters={filters}
              onFilterChange={setFilters}
              categoryOptions={categoryOptions}
              subcategoryOptions={subcategoryOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
                count: opt.count,
                ...(opt.electrodeType && { electrodeType: opt.electrodeType }),
              }))}
              typeOptions={typeOptions}
              propertyRanges={propertyRanges}
              {...(compatibilityOptions && { compatibilityOptions })}
              {...(categories && { categories })}
            />
          </div>
        )}

        {/* Parameters Content */}
        <div className="flex-1">
          {/* Results Header - only show for grid and table views */}
          {(viewMode === 'grid' || viewMode === 'table') && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {isLoading ? (
                  'Searching...'
                ) : (
                  <>
                    Showing {currentPageStart}-{currentPageEnd} of {totalWithMicrofluidic}{' '}
                    parameters
                    {query && ` for "${query}"`}
                  </>
                )}
              </p>
              {viewMode === 'grid' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as ParameterSortOption)}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Parameter View */}
          {renderParameterView()}

          {/* Pagination - only show for grid view */}
          {viewMode === 'grid' && totalResults > pageSize && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {Math.ceil(totalResults / pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(totalResults / pageSize) || isLoading}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
