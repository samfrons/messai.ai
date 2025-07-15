'use client';

import { useState, useCallback } from 'react';
import { Button, Input, Badge } from '@messai/ui';
import ParameterList from './components/ParameterList';
import ParameterFilters from './components/ParameterFilters';
import { useParameterSearch } from './hooks/useParameterSearch';
import { useParameterFilters } from './hooks/useParameterFilters';

export default function ParametersPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

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
            <div className="text-2xl font-bold text-primary-600">{totalResults}</div>
            <div className="text-sm text-gray-600">Total Parameters</div>
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
        {showFilters && (
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

        {/* Parameters Grid */}
        <div className="flex-1">
          {/* Results Header */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  Showing {currentPageStart}-{currentPageEnd} of {totalResults} parameters
                  {query && ` for "${query}"`}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Parameter List */}
          <ParameterList
            parameters={results}
            isLoading={isLoading}
            error={error}
            onParameterSelect={(param) => console.log('Selected:', param)}
          />

          {/* Pagination */}
          {totalResults > pageSize && (
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
