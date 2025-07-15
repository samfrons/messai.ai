import { memo, useState, useMemo } from 'react';
import { Card, Badge, Button, Input } from '@messai/ui';
import { getAvailableCategories, filterParametersByCategory } from '../utils/parameter-categories';
import type { Parameter, DisplayCategory } from '../../../types/parameters';

interface ParameterCategoryViewProps {
  parameters: Parameter[];
  isLoading: boolean;
  error?: string | null;
  onParameterSelect: (parameter: Parameter) => void;
}

const ParameterCategoryView = memo(function ParameterCategoryView({
  parameters,
  isLoading,
  error,
  onParameterSelect,
}: ParameterCategoryViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<DisplayCategory>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter parameters based on search query
  const filteredParameters = useMemo(() => {
    if (!searchQuery) return parameters;

    const searchLower = searchQuery.toLowerCase();
    return parameters.filter(
      (param) =>
        param.name.toLowerCase().includes(searchLower) ||
        param.description?.toLowerCase().includes(searchLower) ||
        param.subcategory?.toLowerCase().includes(searchLower)
    );
  }, [parameters, searchQuery]);

  // Get categories with filtered parameters
  const categoriesWithParams = useMemo(() => {
    const availableCategories = getAvailableCategories(filteredParameters);
    return availableCategories.filter((cat) => cat.count > 0).sort((a, b) => b.count - a.count);
  }, [filteredParameters]);

  const toggleCategory = (category: DisplayCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAllCategories = () => {
    setExpandedCategories(new Set(categoriesWithParams.map((cat) => cat.key)));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  const getCategoryIcon = (category: DisplayCategory) => {
    const icons: Record<DisplayCategory, string> = {
      environmental: '🌡️',
      biological: '🦠',
      electrical: '⚡',
      materials: '🔬',
      chemical: '🧪',
      operational: '⚙️',
      physical: '📏',
      monitoring: '📊',
      economic: '💰',
      performance: '📈',
      safety: '🛡️',
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category: DisplayCategory) => {
    const colors: Record<DisplayCategory, string> = {
      environmental: 'border-green-200 bg-green-50',
      biological: 'border-blue-200 bg-blue-50',
      electrical: 'border-yellow-200 bg-yellow-50',
      materials: 'border-purple-200 bg-purple-50',
      chemical: 'border-red-200 bg-red-50',
      operational: 'border-gray-200 bg-gray-50',
      physical: 'border-indigo-200 bg-indigo-50',
      monitoring: 'border-teal-200 bg-teal-50',
      economic: 'border-orange-200 bg-orange-50',
      performance: 'border-pink-200 bg-pink-50',
      safety: 'border-rose-200 bg-rose-50',
    };
    return colors[category] || 'border-gray-200 bg-gray-50';
  };

  const formatParameterValue = (param: Parameter) => {
    if (param.default !== undefined) {
      return param.unit ? `${param.default} ${param.unit}` : param.default;
    }
    if (param.range) {
      const rangeStr = `${param.range.min || '∞'} - ${param.range.max || '∞'}`;
      return param.unit ? `${rangeStr} ${param.unit}` : rangeStr;
    }
    return param.unit || '-';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Parameters</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  if (parameters.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No parameters found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category View Controls */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Parameters by Category</h3>
              <span className="text-sm text-gray-500">
                ({categoriesWithParams.length} categories, {filteredParameters.length} parameters)
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search parameters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
                <svg
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Expand/Collapse Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAllCategories}
                  className="text-xs"
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAllCategories}
                  className="text-xs"
                >
                  Collapse All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Cards */}
      {categoriesWithParams.map((category) => {
        const isExpanded = expandedCategories.has(category.key);
        const categoryParams = filterParametersByCategory(filteredParameters, category.key);

        return (
          <Card key={category.key} className={`${getCategoryColor(category.key)} border-2`}>
            <div className="p-6">
              {/* Category Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleCategory(category.key)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-label={category.label}>
                    {getCategoryIcon(category.key)}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-white">
                    {category.count} parameters
                  </Badge>
                  <Button variant="ghost" size="sm" className="p-1">
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Button>
                </div>
              </div>

              {/* Category Content */}
              {isExpanded && (
                <div className="mt-6 space-y-3">
                  {categoryParams.map((param) => (
                    <div
                      key={param.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                      onClick={() => onParameterSelect(param)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">{param.name}</h4>
                          {param.subcategory && (
                            <Badge variant="outline" className="text-xs">
                              {param.subcategory}
                            </Badge>
                          )}
                        </div>
                        {param.description && (
                          <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatParameterValue(param)}
                          </div>
                          {param.unit && <div className="text-xs text-gray-500">{param.unit}</div>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onParameterSelect(param);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      })}

      {/* No results message */}
      {filteredParameters.length === 0 && searchQuery && (
        <Card>
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parameters found</h3>
            <p className="text-gray-600">No parameters match your search "{searchQuery}"</p>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-3">
              Clear search
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
});

export default ParameterCategoryView;
