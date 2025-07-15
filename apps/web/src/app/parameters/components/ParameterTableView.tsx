import { memo, useMemo, useState } from 'react';
import { Card, Badge, Button, Input } from '@messai/ui';
import { PARAMETER_CATEGORIES } from '../utils/parameter-categories';
import type { Parameter, ParameterSortOption } from '../../../types/parameters';

interface ParameterTableViewProps {
  parameters: Parameter[];
  isLoading: boolean;
  error?: string | null;
  onParameterSelect: (parameter: Parameter) => void;
  onSortChange?: (sort: ParameterSortOption) => void;
  currentSort?: ParameterSortOption;
}

const ParameterTableView = memo(function ParameterTableView({
  parameters,
  isLoading,
  error,
  onParameterSelect,
  onSortChange,
  currentSort = 'name',
}: ParameterTableViewProps) {
  const [localSearch, setLocalSearch] = useState('');

  // Filter parameters based on local search
  const filteredParameters = useMemo(() => {
    if (!localSearch) return parameters;

    const searchLower = localSearch.toLowerCase();
    return parameters.filter(
      (param) =>
        param.name.toLowerCase().includes(searchLower) ||
        param.description?.toLowerCase().includes(searchLower) ||
        param.subcategory?.toLowerCase().includes(searchLower) ||
        param.unit?.toLowerCase().includes(searchLower)
    );
  }, [parameters, localSearch]);

  const formatValue = (value: any, unit?: string) => {
    if (value === null || value === undefined) return '-';
    if (unit) return `${value} ${unit}`;
    return value;
  };

  const formatRange = (range?: { min?: number; max?: number }, unit?: string) => {
    if (!range || (range.min === undefined && range.max === undefined)) return '-';

    const minStr = range.min !== undefined ? range.min.toString() : '∞';
    const maxStr = range.max !== undefined ? range.max.toString() : '∞';
    const rangeStr = `${minStr} - ${maxStr}`;

    return unit ? `${rangeStr} ${unit}` : rangeStr;
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      environmental: 'bg-green-100 text-green-800',
      biological: 'bg-blue-100 text-blue-800',
      electrical: 'bg-yellow-100 text-yellow-800',
      materials: 'bg-purple-100 text-purple-800',
      chemical: 'bg-red-100 text-red-800',
      operational: 'bg-gray-100 text-gray-800',
      physical: 'bg-indigo-100 text-indigo-800',
      monitoring: 'bg-teal-100 text-teal-800',
      economic: 'bg-orange-100 text-orange-800',
      performance: 'bg-pink-100 text-pink-800',
      safety: 'bg-rose-100 text-rose-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const sortOptions: Array<{ value: ParameterSortOption; label: string }> = [
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'subcategory', label: 'Subcategory' },
    { value: 'unit', label: 'Unit' },
    { value: 'recent', label: 'Recently Added' },
  ];

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
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
    <Card>
      <div className="p-6">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Parameters List</h3>
            <span className="text-sm text-gray-500">({filteredParameters.length} parameters)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Local Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search in table..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
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

            {/* Sort Dropdown */}
            <select
              className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
              value={currentSort}
              onChange={(e) => onSortChange?.(e.target.value as ParameterSortOption)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParameters.map((parameter) => (
                <tr
                  key={parameter.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onParameterSelect(parameter)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{parameter.name}</div>
                      {parameter.description && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                          {parameter.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryBadgeColor(
                        parameter.displayCategory || 'operational'
                      )}`}
                    >
                      {PARAMETER_CATEGORIES[
                        parameter.displayCategory as keyof typeof PARAMETER_CATEGORIES
                      ] || 'Operational'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parameter.subcategory || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{parameter.unit || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatRange(parameter.range, parameter.unit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatValue(parameter.default, parameter.unit)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onParameterSelect(parameter);
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredParameters.length} of {parameters.length} parameters
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>
    </Card>
  );
});

export default ParameterTableView;
