'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  PaperCard,
  PaperDetailModal,
  SearchFilters,
  ActiveFilterTags,
  Pagination,
  type PaperData,
} from '@messai/ui';
import { useResearchAPI } from '../../hooks/useResearchAPI';
import type { ResearchPaper, SortOption } from './types';

/**
 * ResearchPage - Main page for the Research Intelligence System
 *
 * Features:
 * - Semantic search with real-time filtering
 * - Advanced search filters
 * - Paper cards with detailed information
 * - Paper detail modal
 * - Sorting and pagination
 * - Search statistics and insights
 * - Export functionality
 */
export default function ResearchPage() {
  const [selectedPaper, setSelectedPaper] = useState<PaperData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    query,
    filters,
    sortBy,
    page,
    pageSize,
    isLoading,
    results,
    error,
    searchHistory,
    hasActiveFilters,
    totalResults,
    // currentPageStart,
    // currentPageEnd,
    setQuery,
    setFilters,
    setSortBy,
    setPage,
    setPageSize,
    clearFilters,
  } = useResearchAPI();

  // Convert ResearchPaper to PaperData for components
  const convertToPaperData = (paper: ResearchPaper): PaperData => ({
    id: paper.id,
    title: paper.title,
    authors: paper.authors,
    journal: paper.journal,
    year: paper.year,
    researchFocus: paper.researchFocus,
    abstract: paper.abstract,
    performanceMetrics: paper.performanceMetrics,
    citation: paper.citation,
    aiEnhanced: paper.aiEnhanced,
    qualityScore: paper.qualityScore,
    fullTextAvailable: paper.fullTextAvailable,
  });

  const handleSearch = () => {
    setQuery(searchInput);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePaperClick = (paper: PaperData) => {
    setSelectedPaper(paper);
  };

  const handleExportCitation = (paper: PaperData, format: 'bibtex' | 'ris' | 'apa') => {
    // Mock export functionality
    console.log(`Exporting ${paper.title} in ${format} format`);
    // In a real implementation, this would generate and download the citation
  };

  const handleAccessFullText = (paper: PaperData) => {
    // Mock full text access
    console.log(`Accessing full text for ${paper.title}`);
    // In a real implementation, this would open the PDF or redirect to publisher
  };

  // Quick action handlers
  const handleViewRecentPapers = () => {
    setQuery(''); // Clear search query
    setSearchInput('');
    setSortBy('added-desc');
    // Set a minimal filter to trigger search results view
    setFilters({ yearRange: { start: 2020, end: new Date().getFullYear() + 1 } });
  };

  const handleViewCitedPapers = () => {
    setQuery(''); // Clear search query
    setSearchInput('');
    setSortBy('citations-desc');
    // Set a minimal filter to trigger search results view
    setFilters({ minCitations: 0 });
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'year-desc', label: 'Newest First' },
    { value: 'year-asc', label: 'Oldest First' },
    { value: 'citations-desc', label: 'Most Cited' },
    { value: 'quality-desc', label: 'Highest Quality' },
    { value: 'confidence-desc', label: 'AI Confidence' },
  ];

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="grid-12">
        <div className="col-span-12">
          <h1 className="text-responsive-xl font-serif font-light tracking-tight">
            Research Intelligence
          </h1>
          <p className="text-lg mt-4 opacity-60">
            AI-enhanced analysis of research papers with semantic search and knowledge graphs
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="grid-12">
        <div className="col-span-12">
          <Card shadow={false} padding="lg">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-light">Search Papers</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-1.447.894L9 18v-5.586a1 1 0 00-.293-.707L2.293 5.707A1 1 0 012 5V4z"
                      />
                    </svg>
                  }
                >
                  <span>Filters</span>
                  {hasActiveFilters && (
                    <Badge variant="outline" size="sm">
                      Active
                    </Badge>
                  )}
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search papers by keywords, authors, or DOI..."
                    size="lg"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleKeyPress}
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    }
                  />
                </div>
                <Button size="lg" onClick={handleSearch} disabled={isLoading} variant="primary">
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <ActiveFilterTags
                  filters={filters as any}
                  onFiltersChange={setFilters as any}
                  onClearAll={clearFilters}
                />
              )}

              {/* Search History */}
              {searchHistory.length > 0 && !query && (
                <div>
                  <span className="text-sm opacity-60 mr-2">Recent searches:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {searchHistory.slice(0, 5).map((historyQuery, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchInput(historyQuery);
                          setQuery(historyQuery);
                        }}
                        className="text-sm text-black hover:bg-gray-100 px-3 py-1 border border-gray-300 transition-colors"
                      >
                        {historyQuery}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Search Results or Dashboard */}
      {query || hasActiveFilters || results ? (
        /* Search Results Section */
        <div className="grid-12">
          {/* Filters Panel - Left Side */}
          {showFilters && (
            <div className="col-span-12 md:col-span-3 lg:col-span-2">
              <SearchFilters
                filters={filters as any}
                onFiltersChange={setFilters as any}
                showAdvanced={true}
                collapsible={false}
              />
            </div>
          )}

          {/* Search Results - Right Side */}
          <div
            className={`col-span-12 ${showFilters ? 'md:col-span-9 lg:col-span-10' : ''} space-y-6`}
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-serif">Search Results</h3>
                {results && (
                  <div className="flex items-center gap-4 text-sm opacity-60">
                    <span>
                      {results.totalCount.toLocaleString()} papers found
                      {results.totalCount > pageSize && (
                        <span> • Showing {Math.min(pageSize, results.papers.length)} per page</span>
                      )}
                    </span>
                    {results.searchTime && (
                      <span>• Search completed in {results.searchTime}ms</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="border-b border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-black transition-colors"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {error ? (
                // Error state
                <Card shadow={false} className="text-center py-12 border border-red-200 bg-red-50">
                  <svg
                    className="w-16 h-16 text-red-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <h3 className="text-lg mb-2 text-red-800">Search Error</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    variant="secondary"
                    onClick={() => window.location.reload()}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    Retry Search
                  </Button>
                </Card>
              ) : isLoading ? (
                // Loading state
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <Card shadow={false} className="p-8">
                      <div className="space-y-4">
                        <div className="h-6 bg-gray-200 w-3/4"></div>
                        <div className="h-4 bg-gray-200 w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 w-full"></div>
                          <div className="h-4 bg-gray-200 w-2/3"></div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))
              ) : results?.papers.length === 0 ? (
                // No results
                <Card shadow={false} className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg mb-2">No papers found</h3>
                  <p className="opacity-60 mb-4">
                    Try adjusting your search terms or filters to find relevant papers.
                  </p>
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                // Results
                results?.papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={convertToPaperData(paper)}
                    onPaperClick={handlePaperClick}
                    showMetrics={true}
                    truncateAbstract={true}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {results && results.totalCount > 0 && (
              <Pagination
                currentPage={page}
                totalPages={results.totalPages}
                totalItems={totalResults}
                itemsPerPage={pageSize}
                itemsPerPageOptions={[20, 40, 80, 100]}
                onPageChange={setPage}
                onItemsPerPageChange={setPageSize}
                isLoading={isLoading}
                showItemsPerPage={true}
                showPageJump={true}
                showResultCount={true}
                siblingCount={1}
              />
            )}
          </div>
        </div>
      ) : (
        /* Dashboard Section */
        <div className="grid-12">
          {/* Filters Panel - Left Side */}
          {showFilters && (
            <div className="col-span-12 md:col-span-3 lg:col-span-2">
              <SearchFilters
                filters={filters as any}
                onFiltersChange={setFilters as any}
                showAdvanced={true}
                collapsible={false}
              />
            </div>
          )}

          {/* Dashboard Content - Right Side */}
          <div
            className={`col-span-12 ${
              showFilters ? 'md:col-span-9 lg:col-span-10' : ''
            } space-y-12`}
          >
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl tracking-tight">3,721+</div>
                <div className="text-sm opacity-60">Enhanced Papers</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl tracking-tight">1,200+</div>
                <div className="text-sm opacity-60">Knowledge Nodes</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl tracking-tight">2,750+</div>
                <div className="text-sm opacity-60">Connections</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-3xl tracking-tight">150+</div>
                <div className="text-sm opacity-60">Research Categories</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                shadow={false}
                padding="lg"
                className="border-2 border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-light mb-2">Recent Papers</h3>
                    <p className="text-sm opacity-60 mb-4">
                      Browse the latest research papers added to our database
                    </p>
                    <Button variant="secondary" onClick={handleViewRecentPapers} className="w-full">
                      View Recent Papers
                    </Button>
                  </div>
                </div>
              </Card>

              <Card
                shadow={false}
                padding="lg"
                className="border-2 border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-light mb-2">Most Cited Papers</h3>
                    <p className="text-sm opacity-60 mb-4">
                      Explore high-impact research with the most citations
                    </p>
                    <Button variant="secondary" onClick={handleViewCitedPapers} className="w-full">
                      View Highly Cited Papers
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feature Highlights */}
            <Card shadow={false} padding="lg" className="bg-gray-50">
              <h2 className="text-xl font-serif font-light mb-6">Platform Capabilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black text-cream flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L13.09 8.26L17 7L15.74 9.91L22 11L15.74 12.09L17 15L13.09 13.74L12 20L10.91 13.74L7 15L8.26 12.09L2 11L8.26 9.91L7 7L10.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-normal">AI-Enhanced Analysis</h3>
                    <p className="text-sm opacity-60 mt-1">
                      Machine learning models extract performance metrics and insights from research
                      papers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black text-cream flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-normal">Semantic Search</h3>
                    <p className="text-sm opacity-60 mt-1">
                      Advanced search across abstracts, methods, and results with intelligent
                      filtering
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black text-cream flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-normal">Performance Metrics</h3>
                    <p className="text-sm opacity-60 mt-1">
                      Extracted power density, efficiency, and operational data for easy comparison
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-black text-cream flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-normal">Knowledge Graph</h3>
                    <p className="text-sm opacity-60 mt-1">
                      Discover research connections and citation networks across the field
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <PaperDetailModal
          open={!!selectedPaper}
          onClose={() => setSelectedPaper(null)}
          paper={selectedPaper}
          onExportCitation={handleExportCitation}
          onAccessFullText={handleAccessFullText}
          showExportOptions={true}
        />
      )}
    </div>
  );
}
