import { memo, useMemo, useState } from 'react';
import { Card, Badge, Button, Input } from '@messai/ui';
import { PARAMETER_CATEGORIES } from '../utils/parameter-categories';
import type { Parameter, DisplayCategory } from '../../../types/parameters';

interface ParameterCompatibilityMatrixProps {
  parameters: Parameter[];
  isLoading: boolean;
  error?: string | null;
  onParameterSelect: (parameter: Parameter) => void;
}

interface CompatibilityEntry {
  parameter: Parameter;
  compatibleMaterials: string[];
  compatibleMicrobes: string[];
  compatibleEnvironments: string[];
  compatibleSystems: string[];
  compatibilityScore: number;
}

const ParameterCompatibilityMatrix = memo(function ParameterCompatibilityMatrix({
  parameters,
  isLoading,
  error,
  onParameterSelect,
}: ParameterCompatibilityMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<DisplayCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [matrixView, setMatrixView] = useState<'list' | 'matrix'>('list');

  // Process parameters for compatibility analysis
  const compatibilityData = useMemo(() => {
    const data: CompatibilityEntry[] = parameters.map((param) => {
      const compatibility = param.compatibility || {
        materials: [],
        microbes: [],
        environments: [],
        systemTypes: [],
        compatibleWith: [],
        incompatibleWith: [],
      };

      // Calculate compatibility score based on available data
      let score = 0;
      const materials = compatibility.materials || [];
      const microbes = compatibility.microbes || [];
      const environments = compatibility.environments || [];
      const systems = compatibility.systemTypes || [];

      score += materials.length * 2;
      score += microbes.length * 3;
      score += environments.length * 1;
      score += systems.length * 2;

      return {
        parameter: param,
        compatibleMaterials: materials,
        compatibleMicrobes: microbes,
        compatibleEnvironments: environments,
        compatibleSystems: systems,
        compatibilityScore: score,
      };
    });

    // Filter by category
    const filteredData =
      selectedCategory === 'all'
        ? data
        : data.filter((entry) => entry.parameter.displayCategory === selectedCategory);

    // Filter by search query
    const searchFiltered = searchQuery
      ? filteredData.filter(
          (entry) =>
            entry.parameter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.parameter.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.compatibleMaterials.some((m) =>
              m.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            entry.compatibleMicrobes.some((m) =>
              m.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : filteredData;

    return searchFiltered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [parameters, selectedCategory, searchQuery]);

  // Get unique compatibility items for matrix view
  const compatibilityMatrix = useMemo(() => {
    const allMaterials = new Set<string>();
    const allMicrobes = new Set<string>();
    const allEnvironments = new Set<string>();
    const allSystems = new Set<string>();

    compatibilityData.forEach((entry) => {
      entry.compatibleMaterials.forEach((m) => allMaterials.add(m));
      entry.compatibleMicrobes.forEach((m) => allMicrobes.add(m));
      entry.compatibleEnvironments.forEach((e) => allEnvironments.add(e));
      entry.compatibleSystems.forEach((s) => allSystems.add(s));
    });

    return {
      materials: Array.from(allMaterials),
      microbes: Array.from(allMicrobes),
      environments: Array.from(allEnvironments),
      systems: Array.from(allSystems),
    };
  }, [compatibilityData]);

  const getCompatibilityLevel = (score: number) => {
    if (score >= 15) return { level: 'High', color: 'bg-green-100 text-green-800', icon: '✓' };
    if (score >= 8) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '○' };
    if (score > 0) return { level: 'Low', color: 'bg-orange-100 text-orange-800', icon: '△' };
    return { level: 'None', color: 'bg-gray-100 text-gray-800', icon: '×' };
  };

  const getCategoryOptions = () => {
    const categories: Array<{ key: DisplayCategory | 'all'; label: string; count: number }> = [
      { key: 'all', label: 'All Categories', count: parameters.length },
    ];

    Object.entries(PARAMETER_CATEGORIES).forEach(([key, label]) => {
      const count = parameters.filter((p) => p.displayCategory === key).length;
      if (count > 0) {
        categories.push({ key: key as DisplayCategory, label, count });
      }
    });

    return categories;
  };

  const renderCompatibilityBadges = (
    items: string[],
    type: 'materials' | 'microbes' | 'environments' | 'systems'
  ) => {
    const colors = {
      materials: 'bg-purple-100 text-purple-800',
      microbes: 'bg-blue-100 text-blue-800',
      environments: 'bg-green-100 text-green-800',
      systems: 'bg-orange-100 text-orange-800',
    };

    return items.slice(0, 3).map((item, index) => (
      <Badge key={index} variant="outline" className={`text-xs ${colors[type]}`}>
        {item}
      </Badge>
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Compatibility Data
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Parameter Compatibility Matrix
              </h3>
              <span className="text-sm text-gray-500">
                ({compatibilityData.length} parameters analyzed)
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

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as DisplayCategory | 'all')}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                {getCategoryOptions().map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex rounded-md border border-gray-300 overflow-hidden">
                <Button
                  variant={matrixView === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setMatrixView('list')}
                  className="rounded-none"
                >
                  List View
                </Button>
                <Button
                  variant={matrixView === 'matrix' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setMatrixView('matrix')}
                  className="rounded-none"
                >
                  Matrix View
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Compatibility Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {compatibilityMatrix.materials.length}
            </div>
            <div className="text-sm text-gray-600">Compatible Materials</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {compatibilityMatrix.microbes.length}
            </div>
            <div className="text-sm text-gray-600">Compatible Microbes</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {compatibilityMatrix.environments.length}
            </div>
            <div className="text-sm text-gray-600">Compatible Environments</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {compatibilityMatrix.systems.length}
            </div>
            <div className="text-sm text-gray-600">Compatible Systems</div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {matrixView === 'list' ? (
        <Card>
          <div className="p-6">
            <div className="space-y-4">
              {compatibilityData.map((entry) => {
                const compatLevel = getCompatibilityLevel(entry.compatibilityScore);

                return (
                  <div
                    key={entry.parameter.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => onParameterSelect(entry.parameter)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{entry.parameter.name}</h4>
                          <Badge variant="outline" className={`text-xs ${compatLevel.color}`}>
                            {compatLevel.icon} {compatLevel.level}
                          </Badge>
                          {entry.parameter.displayCategory && (
                            <Badge variant="outline" className="text-xs">
                              {
                                PARAMETER_CATEGORIES[
                                  entry.parameter
                                    .displayCategory as keyof typeof PARAMETER_CATEGORIES
                                ]
                              }
                            </Badge>
                          )}
                        </div>

                        {entry.parameter.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {entry.parameter.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Materials</div>
                            <div className="flex flex-wrap gap-1">
                              {entry.compatibleMaterials.length > 0 ? (
                                renderCompatibilityBadges(entry.compatibleMaterials, 'materials')
                              ) : (
                                <span className="text-xs text-gray-400">None specified</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Microbes</div>
                            <div className="flex flex-wrap gap-1">
                              {entry.compatibleMicrobes.length > 0 ? (
                                renderCompatibilityBadges(entry.compatibleMicrobes, 'microbes')
                              ) : (
                                <span className="text-xs text-gray-400">None specified</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              Environments
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {entry.compatibleEnvironments.length > 0 ? (
                                renderCompatibilityBadges(
                                  entry.compatibleEnvironments,
                                  'environments'
                                )
                              ) : (
                                <span className="text-xs text-gray-400">None specified</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Systems</div>
                            <div className="flex flex-wrap gap-1">
                              {entry.compatibleSystems.length > 0 ? (
                                renderCompatibilityBadges(entry.compatibleSystems, 'systems')
                              ) : (
                                <span className="text-xs text-gray-400">None specified</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onParameterSelect(entry.parameter);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {compatibilityData.length === 0 && (
              <div className="text-center py-8">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No compatible parameters found
                </h3>
                <p className="text-gray-600">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Matrix View</h3>
              <p className="text-gray-600 mb-4">
                Interactive compatibility matrix visualization coming soon
              </p>
              <Button variant="outline" onClick={() => setMatrixView('list')}>
                Switch to List View
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

export default ParameterCompatibilityMatrix;
