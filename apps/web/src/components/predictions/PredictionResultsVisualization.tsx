'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Button, Badge } from '@messai/ui';
import type { PerformancePrediction } from '../../types/predictions';
import { PERFORMANCE_BENCHMARKS, PARAMETER_UNITS } from '../../data/prediction-constants';

interface PredictionResultsVisualizationProps {
  prediction: PerformancePrediction;
  onExport?: () => void;
  onSave?: () => void;
}

export default function PredictionResultsVisualization({
  prediction,
  onExport,
  onSave,
}: PredictionResultsVisualizationProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'power' | 'efficiency' | 'economics' | 'recommendations'
  >('overview');

  // Get performance quality rating
  const getPerformanceRating = (value: number, benchmark: any) => {
    if (value >= benchmark.excellent) return { rating: 'Excellent', color: 'green' };
    if (value >= benchmark.good) return { rating: 'Good', color: 'blue' };
    if (value >= benchmark.average) return { rating: 'Average', color: 'yellow' };
    return { rating: 'Below Average', color: 'red' };
  };

  // Power curve data for visualization
  const powerCurveData = prediction.powerOutput.powerCurve.map((point) => ({
    voltage: point.voltage,
    current: point.current,
    power: point.power,
  }));

  // Efficiency breakdown data
  const efficiencyData = [
    { name: 'Coulombic', value: prediction.efficiency.coulombicEfficiency, fill: '#3B82F6' },
    { name: 'Energy', value: prediction.efficiency.energyEfficiency, fill: '#10B981' },
    { name: 'Substrate', value: prediction.efficiency.substrateRemovalRate, fill: '#F59E0B' },
    {
      name: 'Carbon Conv.',
      value: prediction.efficiency.carbonConversionEfficiency,
      fill: '#EF4444',
    },
  ];

  // Confidence breakdown data
  const confidenceData = Object.entries(prediction.confidence.breakdown).map(([key, value]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
    value: value,
    fill: value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444',
  }));

  // Performance metrics for overview
  const performanceMetrics = [
    {
      label: 'Power Density',
      value: prediction.powerOutput.powerDensity,
      unit: PARAMETER_UNITS.powerDensity,
      rating: getPerformanceRating(
        prediction.powerOutput.powerDensity,
        PERFORMANCE_BENCHMARKS.powerDensity
      ),
      icon: '⚡',
    },
    {
      label: 'Coulombic Efficiency',
      value: prediction.efficiency.coulombicEfficiency,
      unit: PARAMETER_UNITS.efficiency,
      rating: getPerformanceRating(
        prediction.efficiency.coulombicEfficiency,
        PERFORMANCE_BENCHMARKS.coulombicEfficiency
      ),
      icon: '🔋',
    },
    {
      label: 'Energy Efficiency',
      value: prediction.efficiency.energyEfficiency,
      unit: PARAMETER_UNITS.efficiency,
      rating: getPerformanceRating(
        prediction.efficiency.energyEfficiency,
        PERFORMANCE_BENCHMARKS.energyEfficiency
      ),
      icon: '⚙️',
    },
    {
      label: 'Overall Confidence',
      value: prediction.confidence.overall,
      unit: '%',
      rating: {
        rating:
          prediction.confidence.overall >= 85
            ? 'High'
            : prediction.confidence.overall >= 70
              ? 'Good'
              : 'Moderate',
        color:
          prediction.confidence.overall >= 85
            ? 'green'
            : prediction.confidence.overall >= 70
              ? 'blue'
              : 'yellow',
      },
      icon: '🎯',
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value.toFixed(2)} ${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prediction Results</h2>
          <p className="text-gray-600">Generated on {prediction.createdAt.toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          {onSave && (
            <Button variant="outline" onClick={onSave}>
              Save Configuration
            </Button>
          )}
          {onExport && <Button onClick={onExport}>Export Results</Button>}
        </div>
      </div>

      {/* Overall Confidence Score */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Prediction Confidence</h3>
          <Badge
            variant={
              prediction.confidence.overall >= 85
                ? 'success'
                : prediction.confidence.overall >= 70
                  ? 'primary'
                  : 'warning'
            }
            className="text-lg px-3 py-1"
          >
            {prediction.confidence.overall}% Confidence
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {prediction.confidence.factors.paperCount}
            </div>
            <div className="text-sm text-gray-600">Training Papers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {prediction.confidence.factors.parameterCoverage}%
            </div>
            <div className="text-sm text-gray-600">Parameter Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ±{prediction.confidence.breakdown.uncertaintyRange}%
            </div>
            <div className="text-sm text-gray-600">Uncertainty Range</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={confidenceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'power', label: 'Power Analysis' },
            { id: 'efficiency', label: 'Efficiency' },
            { id: 'economics', label: 'Economics' },
            { id: 'recommendations', label: 'Optimization' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <div className="text-center">
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value.toFixed(1)} {metric.unit}
                </div>
                <div className="text-sm text-gray-600 mb-2">{metric.label}</div>
                <Badge
                  variant={
                    metric.rating.color === 'green'
                      ? 'success'
                      : metric.rating.color === 'blue'
                        ? 'primary'
                        : metric.rating.color === 'yellow'
                          ? 'warning'
                          : 'error'
                  }
                >
                  {metric.rating.rating}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'power' && (
        <div className="space-y-6">
          {/* Power Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {prediction.powerOutput.voltage.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">Voltage (V)</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {prediction.powerOutput.current.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">Current (A)</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {prediction.powerOutput.powerDensity.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Power Density (mW/cm²)</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {prediction.powerOutput.energyDensity.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Energy Density (Wh/kg)</div>
              </div>
            </Card>
          </div>

          {/* Power Curve Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Power Curve Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={powerCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="voltage"
                  label={{ value: 'Voltage (V)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  yAxisId="left"
                  label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Power (W)', angle: 90, position: 'insideRight' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="current"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Current"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="power"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Power"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="space-y-6">
          {/* Efficiency Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {efficiencyData.map((eff, index) => (
              <Card key={index}>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{eff.value.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">{eff.name} Efficiency</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Efficiency Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={efficiencyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value?.toFixed(1) || 0}%`}
                  >
                    {efficiencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Startup Time:</span>
                  <span className="font-medium">{prediction.performance.startupTime} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stability Index:</span>
                  <span className="font-medium">
                    {(prediction.performance.stabilityIndex * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lifespan Estimate:</span>
                  <span className="font-medium">
                    {prediction.performance.lifespanEstimate} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maintenance Frequency:</span>
                  <span className="font-medium">
                    Every {prediction.performance.maintenanceFrequency} days
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'economics' && (
        <div className="space-y-6">
          {/* Economic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${prediction.economics.materialCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Material Cost</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${prediction.economics.operatingCost.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Operating Cost/Day</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${prediction.economics.energyValue.toFixed(3)}
                </div>
                <div className="text-sm text-gray-600">Energy Value/Day</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    prediction.economics.roi > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {prediction.economics.roi.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Annual ROI</div>
              </div>
            </Card>
          </div>

          {/* Economic Analysis Chart */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Economic Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Initial Investment:</span>
                    <span className="font-medium">
                      ${prediction.economics.materialCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Operating Cost:</span>
                    <span className="font-medium">
                      ${prediction.economics.operatingCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Operating Cost:</span>
                    <span className="font-medium">
                      ${(prediction.economics.operatingCost * 365).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Revenue Projection</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Daily Energy Value:</span>
                    <span className="font-medium">
                      ${prediction.economics.energyValue.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Energy Value:</span>
                    <span className="font-medium">
                      ${(prediction.economics.energyValue * 365).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payback Period:</span>
                    <span className="font-medium">
                      {prediction.economics.paybackPeriod.toFixed(1)} months
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
          {prediction.optimizations.length > 0 ? (
            prediction.optimizations.map((rec, index) => (
              <Card key={index}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          rec.priority === 'high'
                            ? 'error'
                            : rec.priority === 'medium'
                              ? 'warning'
                              : 'info'
                        }
                      >
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                      <Badge variant="gray">{rec.impact.toUpperCase()} IMPACT</Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{rec.description}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Parameter: {rec.parameter}</div>
                      <div>
                        Current Value: {rec.currentValue} → Recommended: {rec.recommendedValue}
                      </div>
                      <div>Expected Improvement: +{rec.expectedImprovement}%</div>
                      <div>Implementation Cost: ${rec.implementationCost}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{rec.confidence}%</div>
                    <div className="text-xs text-gray-600">Confidence</div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Configuration Optimized</h3>
                <p className="text-gray-600">
                  Your current configuration is well-optimized. No significant improvements
                  identified.
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
