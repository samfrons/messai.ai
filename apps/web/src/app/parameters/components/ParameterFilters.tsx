import { useState } from 'react';
import { Card, Button } from '@messai/ui';
import type {
  ParameterFilter,
  ParameterType,
  ElectrodeType,
  ParameterCategoryData,
  DisplayCategory,
} from '../../../types/parameters';

interface ParameterFiltersProps {
  filters: ParameterFilter;
  onFilterChange: (filters: ParameterFilter) => void;
  categoryOptions: Array<{
    value: DisplayCategory;
    label: string;
    count: number;
    description?: string;
  }>;
  subcategoryOptions: Array<{
    value: string;
    label: string;
    count: number;
    electrodeType?: ElectrodeType;
  }>;
  typeOptions: Array<{ value: ParameterType; label: string; count: number }>;
  propertyRanges: {
    conductivity?: { min: number; max: number };
    cost?: { min: number; max: number };
    temperature?: { min: number; max: number };
    ph?: { min: number; max: number };
    [key: string]: { min: number; max: number } | undefined;
  };
  compatibilityOptions?: {
    materials: Array<{ value: string; count: number }>;
    microbes: Array<{ value: string; count: number }>;
    environments: Array<{ value: string; count: number }>;
    systemTypes: Array<{ value: string; count: number }>;
  };
  categories?: ParameterCategoryData[];
}

export default function ParameterFilters({
  filters,
  onFilterChange,
  categoryOptions,
  subcategoryOptions,
  typeOptions,
  propertyRanges,
  compatibilityOptions,
}: ParameterFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const updateFilter = (key: keyof ParameterFilter, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const updateCompatibilityFilter = (category: string, values: string[]) => {
    const currentCompatibility = filters.compatibility || {};
    onFilterChange({
      ...filters,
      compatibility: {
        ...currentCompatibility,
        [category]: values.length > 0 ? values : undefined,
      },
    });
  };

  const toggleCompatibilityValue = (category: string, value: string) => {
    const currentValues =
      filters.compatibility?.[category as keyof typeof filters.compatibility] || [];
    const isSelected = Array.isArray(currentValues) && currentValues.includes(value);

    let newValues: string[];
    if (isSelected) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = Array.isArray(currentValues) ? [...currentValues, value] : [value];
    }

    updateCompatibilityFilter(category, newValues);
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
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Subcategory
            {filters.category === 'materials' && (
              <span className="text-xs text-gray-500 ml-1">(Anodes & Cathodes)</span>
            )}
          </h4>
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
                <span className="ml-2 text-sm text-gray-700 flex items-center gap-2">
                  {option.label}
                  {option.electrodeType && (
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded ${
                        option.electrodeType === 'anode'
                          ? 'bg-red-100 text-red-700'
                          : option.electrodeType === 'cathode'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {option.electrodeType}
                    </span>
                  )}
                  <span className="text-gray-500">({option.count})</span>
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

      {/* Advanced Filters Toggle */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between"
        >
          Advanced Filters
          <span className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
        </Button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            {/* Additional Properties */}
            {Object.entries(propertyRanges)
              .filter(([key]) => !['conductivity', 'cost', 'temperature', 'ph'].includes(key))
              .map(([property, range]) => (
                <div key={property}>
                  <label className="text-sm text-gray-700 capitalize">
                    {property.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      placeholder={`${range?.min || 0}`}
                      value={filters.properties?.[property]?.min || ''}
                      onChange={(e) => updatePropertyFilter(property, 'min', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder={`${range?.max || 100}`}
                      value={filters.properties?.[property]?.max || ''}
                      onChange={(e) => updatePropertyFilter(property, 'max', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    {filters.properties?.[property] && (
                      <button
                        onClick={() => clearPropertyFilter(property)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {/* Validation Rules Filter */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasValidationRules === true}
                  onChange={(e) =>
                    updateFilter('hasValidationRules', e.target.checked ? true : undefined)
                  }
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has validation rules</span>
              </label>
            </div>

            {/* Typical Range Filter */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasTypicalRange === true}
                  onChange={(e) =>
                    updateFilter('hasTypicalRange', e.target.checked ? true : undefined)
                  }
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has typical range</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Compatibility Matrix Filters */}
      {compatibilityOptions && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompatibility(!showCompatibility)}
            className="w-full justify-between"
          >
            Compatibility Matrix
            <span className={`transition-transform ${showCompatibility ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </Button>

          {showCompatibility && (
            <div className="mt-4 space-y-4">
              {/* Materials */}
              {compatibilityOptions.materials.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Compatible Materials</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {compatibilityOptions.materials.map((material) => (
                      <label key={material.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            filters.compatibility?.materials?.includes(material.value) || false
                          }
                          onChange={() => toggleCompatibilityValue('materials', material.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {material.value}
                          <span className="text-gray-500 ml-1">({material.count})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Microbes */}
              {compatibilityOptions.microbes.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Compatible Microbes</h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {compatibilityOptions.microbes.map((microbe) => (
                      <label key={microbe.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            filters.compatibility?.microbes?.includes(microbe.value) || false
                          }
                          onChange={() => toggleCompatibilityValue('microbes', microbe.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {microbe.value}
                          <span className="text-gray-500 ml-1">({microbe.count})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Environments */}
              {compatibilityOptions.environments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    Compatible Environments
                  </h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {compatibilityOptions.environments.map((env) => (
                      <label key={env.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            filters.compatibility?.environments?.includes(env.value) || false
                          }
                          onChange={() => toggleCompatibilityValue('environments', env.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {env.value}
                          <span className="text-gray-500 ml-1">({env.count})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* System Types */}
              {compatibilityOptions.systemTypes.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                    Compatible System Types
                  </h5>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {compatibilityOptions.systemTypes.map((system) => (
                      <label key={system.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            filters.compatibility?.systemTypes?.includes(system.value) || false
                          }
                          onChange={() => toggleCompatibilityValue('systemTypes', system.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {system.value}
                          <span className="text-gray-500 ml-1">({system.count})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
