'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Button, Badge } from '@messai/ui';
import type { PerformancePrediction, ComparisonMetric } from '../../types/predictions';

interface PredictionHistoryProps {
  predictions: PerformancePrediction[];
  onComparePredictions?: (predictionIds: string[]) => void;
  onDeletePrediction?: (predictionId: string) => void;
}

export default function PredictionHistory({
  predictions,
  onComparePredictions,
  onDeletePrediction,
}: PredictionHistoryProps) {
  const [selectedPredictions, setSelectedPredictions] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetric[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'power' | 'efficiency' | 'confidence'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'high_confidence' | 'recent'>('all');

  // Toggle prediction selection for comparison
  const togglePredictionSelection = (predictionId: string) => {
    setSelectedPredictions((prev) => {
      if (prev.includes(predictionId)) {
        return prev.filter((id) => id !== predictionId);
      } else if (prev.length < 5) {
        // Limit to 5 predictions for comparison
        return [...prev, predictionId];
      }
      return prev;
    });
  };

  // Filter and sort predictions
  const getFilteredAndSortedPredictions = () => {
    let filtered = [...predictions];

    // Apply filters
    switch (filterBy) {
      case 'high_confidence':
        filtered = filtered.filter((p) => p.confidence.overall >= 80);
        break;
      case 'recent':
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((p) => p.createdAt >= oneWeekAgo);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'power':
        filtered.sort((a, b) => b.powerOutput.powerDensity - a.powerOutput.powerDensity);
        break;
      case 'efficiency':
        filtered.sort(
          (a, b) => b.efficiency.coulombicEfficiency - a.efficiency.coulombicEfficiency
        );
        break;
      case 'confidence':
        filtered.sort((a, b) => b.confidence.overall - a.confidence.overall);
        break;
    }

    return filtered;
  };

  // Generate comparison metrics when predictions are selected
  useEffect(() => {
    if (selectedPredictions.length >= 2) {
      const selectedPreds = predictions.filter((p) => selectedPredictions.includes(p.id));
      const metrics: ComparisonMetric[] = [
        {
          name: 'Power Density',
          values: Object.fromEntries(selectedPreds.map((p) => [p.id, p.powerOutput.powerDensity])),
          unit: 'mW/cm²',
          optimal: 'higher',
        },
        {
          name: 'Coulombic Efficiency',
          values: Object.fromEntries(
            selectedPreds.map((p) => [p.id, p.efficiency.coulombicEfficiency])
          ),
          unit: '%',
          optimal: 'higher',
        },
        {
          name: 'Energy Efficiency',
          values: Object.fromEntries(
            selectedPreds.map((p) => [p.id, p.efficiency.energyEfficiency])
          ),
          unit: '%',
          optimal: 'higher',
        },
        {
          name: 'Material Cost',
          values: Object.fromEntries(selectedPreds.map((p) => [p.id, p.economics.materialCost])),
          unit: '$',
          optimal: 'lower',
        },
        {
          name: 'ROI',
          values: Object.fromEntries(selectedPreds.map((p) => [p.id, p.economics.roi])),
          unit: '%',
          optimal: 'higher',
        },
        {
          name: 'Confidence',
          values: Object.fromEntries(selectedPreds.map((p) => [p.id, p.confidence.overall])),
          unit: '%',
          optimal: 'higher',
        },
      ];
      setComparisonMetrics(metrics);
    } else {
      setComparisonMetrics([]);
    }
  }, [selectedPredictions, predictions]);

  // Start comparison mode
  const startComparison = () => {
    if (selectedPredictions.length >= 2) {
      setComparisonMode(true);
      if (onComparePredictions) {
        onComparePredictions(selectedPredictions);
      }
    }
  };

  // Exit comparison mode
  const exitComparison = () => {
    setComparisonMode(false);
    setSelectedPredictions([]);
  };

  // Get confidence badge variant
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) return { variant: 'success' as const, label: 'High' };
    if (confidence >= 70) return { variant: 'primary' as const, label: 'Good' };
    if (confidence >= 55) return { variant: 'warning' as const, label: 'Moderate' };
    return { variant: 'error' as const, label: 'Low' };
  };

  // Generate radar chart data for comparison
  const getRadarData = () => {
    if (comparisonMetrics.length === 0) return [];

    return comparisonMetrics.map((metric) => {
      const dataPoint: any = { metric: metric.name };
      selectedPredictions.forEach((predId, index) => {
        const value = metric.values[predId];
        if (value !== undefined) {
          // Normalize values to 0-100 scale for radar chart
          const normalizedValue =
            metric.name === 'Material Cost'
              ? 100 - (value / Math.max(...Object.values(metric.values))) * 100 // Invert cost
              : (value / Math.max(...Object.values(metric.values))) * 100;
          dataPoint[`Prediction ${index + 1}`] = normalizedValue;
        }
      });
      return dataPoint;
    });
  };

  const filteredPredictions = getFilteredAndSortedPredictions();

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prediction History</h2>
          <p className="text-gray-600">{predictions.length} total predictions</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedPredictions.length >= 2 && !comparisonMode && (
            <Button onClick={startComparison}>
              Compare {selectedPredictions.length} Predictions
            </Button>
          )}
          {comparisonMode && (
            <Button onClick={exitComparison} variant="outline">
              Exit Comparison
            </Button>
          )}
        </div>
      </div>

      {!comparisonMode ? (
        <>
          {/* Filters and Sorting */}
          <Card>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="date">Date Created</option>
                  <option value="power">Power Density</option>
                  <option value="efficiency">Efficiency</option>
                  <option value="confidence">Confidence</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All Predictions</option>
                  <option value="high_confidence">High Confidence (≥80%)</option>
                  <option value="recent">Recent (Last 7 days)</option>
                </select>
              </div>
              {selectedPredictions.length > 0 && (
                <div className="ml-auto">
                  <Badge variant="info">{selectedPredictions.length} selected for comparison</Badge>
                </div>
              )}
            </div>
          </Card>

          {/* History Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{predictions.length}</div>
                <div className="text-sm text-gray-600">Total Predictions</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {predictions.filter((p) => p.confidence.overall >= 80).length}
                </div>
                <div className="text-sm text-gray-600">High Confidence</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {predictions.length > 0
                    ? (
                        predictions.reduce((sum, p) => sum + p.powerOutput.powerDensity, 0) /
                        predictions.length
                      ).toFixed(1)
                    : '0'}
                </div>
                <div className="text-sm text-gray-600">Avg Power Density</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    predictions.filter((p) => {
                      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return p.createdAt >= oneWeekAgo;
                    }).length
                  }
                </div>
                <div className="text-sm text-gray-600">This Week</div>
              </div>
            </Card>
          </div>

          {/* Predictions List */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction History</h3>
            <div className="space-y-3">
              {filteredPredictions.length > 0 ? (
                filteredPredictions.map((prediction) => {
                  const confidenceBadge = getConfidenceBadge(prediction.confidence.overall);
                  const isSelected = selectedPredictions.includes(prediction.id);

                  return (
                    <div
                      key={prediction.id}
                      className={`p-4 border rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => togglePredictionSelection(prediction.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              Prediction #{prediction.id.slice(-8)}
                            </h4>
                            <Badge variant={confidenceBadge.variant}>
                              {prediction.confidence.overall}% {confidenceBadge.label}
                            </Badge>
                            {isSelected && <Badge variant="primary">Selected</Badge>}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Power Density:</span>
                              <div className="font-medium">
                                {prediction.powerOutput.powerDensity.toFixed(2)} mW/cm²
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Efficiency:</span>
                              <div className="font-medium">
                                {prediction.efficiency.coulombicEfficiency.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">ROI:</span>
                              <div
                                className={`font-medium ${
                                  prediction.economics.roi > 0 ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {prediction.economics.roi.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Created:</span>
                              <div className="font-medium">
                                {prediction.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {onDeletePrediction && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePrediction(prediction.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No predictions found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or create a new prediction.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      ) : (
        /* Comparison View */
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prediction Comparison ({selectedPredictions.length} predictions)
            </h3>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Metric</th>
                    {selectedPredictions.map((predId, index) => (
                      <th key={predId} className="text-center py-2">
                        Prediction {index + 1}
                      </th>
                    ))}
                    <th className="text-center py-2">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMetrics.map((metric) => {
                    const values = Object.values(metric.values);
                    const bestValue =
                      metric.optimal === 'higher' ? Math.max(...values) : Math.min(...values);

                    return (
                      <tr key={metric.name} className="border-b">
                        <td className="py-3 font-medium">{metric.name}</td>
                        {selectedPredictions.map((predId) => {
                          const value = metric.values[predId];
                          const isBest = value === bestValue;

                          return (
                            <td
                              key={predId}
                              className={`text-center py-3 ${
                                isBest ? 'font-bold text-green-600' : ''
                              }`}
                            >
                              {value?.toFixed(metric.name.includes('Cost') ? 2 : 1) || 'N/A'}{' '}
                              {metric.unit}
                              {isBest && ' ⭐'}
                            </td>
                          );
                        })}
                        <td className="text-center py-3 font-bold text-green-600">
                          {bestValue?.toFixed(metric.name.includes('Cost') ? 2 : 1) || 'N/A'}{' '}
                          {metric.unit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Radar Chart Comparison */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Radar Comparison
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                {selectedPredictions.map((predId, index) => (
                  <Radar
                    key={predId}
                    name={`Prediction ${index + 1}`}
                    dataKey={`Prediction ${index + 1}`}
                    stroke={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]}
                    fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Bar Chart Comparison */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metric Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedPredictions.map((predId, index) => (
                  <Bar
                    key={predId}
                    dataKey={`values.${predId}`}
                    fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index]}
                    name={`Prediction ${index + 1}`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
