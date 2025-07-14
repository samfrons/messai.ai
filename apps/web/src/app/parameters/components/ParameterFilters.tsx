import React from 'react';
import { Card, Button } from '@messai/ui';
import type { ParameterFilter, ParameterCategory, ParameterType } from '../../../types/parameters';

interface ParameterFiltersProps {
  filters: ParameterFilter;
  onFilterChange: (filters: ParameterFilter) => void;
  categoryOptions: Array<{ value: ParameterCategory; label: string; count: number }>;
  subcategoryOptions: Array<{ value: string; label: string; count: number }>;
  typeOptions: Array<{ value: ParameterType; label: string; count: number }>;
  propertyRanges: {
    conductivity?: { min: number; max: number };
    cost?: { min: number; max: number };
    temperature?: { min: number; max: number };
    ph?: { min: number; max: number };
  };
}

export default function ParameterFilters({
  filters,
  onFilterChange,
  categoryOptions,
  subcategoryOptions,
  typeOptions,
  propertyRanges,
}: ParameterFiltersProps) {
  const updateFilter = (key: keyof ParameterFilter, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const updatePropertyFilter = (property: string, type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    const currentProperties = filters.properties || {};
    const currentPropertyFilter = currentProperties[property] || {};

    onFilterChange({
      ...filters,
      properties: {
        ...currentProperties,
        [property]: {
          ...currentPropertyFilter,
          [type]: numValue,
        },
      },
    });
  };

  const clearPropertyFilter = (property: string) => {
    const currentProperties = { ...filters.properties };
    delete currentProperties[property];
    onFilterChange({ ...filters, properties: currentProperties });
  };

  const clearAllFilters = () => {
    onFilterChange({});
  };

  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear all
        </Button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          {categoryOptions.map((option) => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                value={option.value}
                checked={filters.category === option.value}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {option.label}
                <span className="text-gray-500 ml-1">({option.count})</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategory Filter - Only show if category is selected */}
      {filters.category && subcategoryOptions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Subcategory</h4>
          <div className="space-y-2">
            {subcategoryOptions.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="subcategory"
                  value={option.value}
                  checked={filters.subcategory === option.value}
                  onChange={(e) => updateFilter('subcategory', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option.label}
                  <span className="text-gray-500 ml-1">({option.count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Type Filter - Only show if category is selected */}
      {filters.category && typeOptions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Type</h4>
          <div className="space-y-2">
            {typeOptions.map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={filters.type === option.value}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {option.label}
                  <span className="text-gray-500 ml-1">({option.count})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Property Range Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Properties</h4>
        <div className="space-y-4">
          {/* Conductivity Range */}
          {propertyRanges.conductivity && (
            <div>
              <label className="text-sm text-gray-700">Conductivity (S/m)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  placeholder={`${propertyRanges.conductivity.min}`}
                  value={filters.properties?.['conductivity']?.min || ''}
                  onChange={(e) => updatePropertyFilter('conductivity', 'min', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder={`${propertyRanges.conductivity.max}`}
                  value={filters.properties?.['conductivity']?.max || ''}
                  onChange={(e) => updatePropertyFilter('conductivity', 'max', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                {filters.properties?.['conductivity'] && (
                  <button
                    onClick={() => clearPropertyFilter('conductivity')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cost Range */}
          {propertyRanges.cost && (
            <div>
              <label className="text-sm text-gray-700">Cost ($/kg)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  placeholder={`${propertyRanges.cost.min}`}
                  value={filters.properties?.['cost']?.min || ''}
                  onChange={(e) => updatePropertyFilter('cost', 'min', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder={`${propertyRanges.cost.max}`}
                  value={filters.properties?.['cost']?.max || ''}
                  onChange={(e) => updatePropertyFilter('cost', 'max', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                {filters.properties?.['cost'] && (
                  <button
                    onClick={() => clearPropertyFilter('cost')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Temperature Range */}
          {propertyRanges.temperature && (
            <div>
              <label className="text-sm text-gray-700">Temperature (°C)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  placeholder={`${propertyRanges.temperature.min}`}
                  value={filters.properties?.['temperature']?.min || ''}
                  onChange={(e) => updatePropertyFilter('temperature', 'min', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder={`${propertyRanges.temperature.max}`}
                  value={filters.properties?.['temperature']?.max || ''}
                  onChange={(e) => updatePropertyFilter('temperature', 'max', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                {filters.properties?.['temperature'] && (
                  <button
                    onClick={() => clearPropertyFilter('temperature')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* pH Range */}
          {propertyRanges.ph && (
            <div>
              <label className="text-sm text-gray-700">pH</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  placeholder={`${propertyRanges.ph.min}`}
                  value={filters.properties?.['ph']?.min || ''}
                  onChange={(e) => updatePropertyFilter('ph', 'min', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder={`${propertyRanges.ph.max}`}
                  value={filters.properties?.['ph']?.max || ''}
                  onChange={(e) => updatePropertyFilter('ph', 'max', e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                {filters.properties?.['ph'] && (
                  <button
                    onClick={() => clearPropertyFilter('ph')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom vs System Toggle */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Parameter Source</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlySystem === true}
              onChange={(e) => updateFilter('onlySystem', e.target.checked ? true : undefined)}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">System parameters only</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyCustom === true}
              onChange={(e) => updateFilter('onlyCustom', e.target.checked ? true : undefined)}
              className="text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Custom parameters only</span>
          </label>
        </div>
      </div>
    </Card>
  );
}
