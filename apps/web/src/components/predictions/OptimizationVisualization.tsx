'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, Button, Badge } from '@messai/ui';
import type {
  OptimizationRequest,
  OptimizationResult,
  OptimizationAlgorithm,
  PredictionConfiguration,
} from '../../types/predictions';
import { optimizationEngine } from '../../lib/optimization-algorithms';
import type { OptimizationVisualization } from '../../lib/optimization-algorithms';

interface OptimizationVisualizationProps {
  baseConfiguration: PredictionConfiguration;
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

export default function OptimizationVisualizationComponent({
  baseConfiguration,
  onOptimizationComplete,
}: OptimizationVisualizationProps) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<OptimizationAlgorithm>('genetic');
  const [optimizationRequest, setOptimizationRequest] = useState<OptimizationRequest>({
    configurationId: baseConfiguration.id,
    algorithm: 'genetic',
    objectives: [
      { parameter: 'power_output', weight: 0.4, target: 'maximize' },
      { parameter: 'efficiency', weight: 0.3, target: 'maximize' },
      { parameter: 'cost', weight: 0.3, target: 'minimize' },
    ],
    constraints: [
      { parameter: 'temperature', min: 20, max: 40 },
      { parameter: 'ph', min: 6.0, max: 8.0 },
    ],
    maxIterations: 50,
    populationSize: 30,
    learningRate: 0.01,
    convergenceThreshold: 0.001,
  });

  const [visualization, setVisualization] = useState<OptimizationVisualization | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  // Algorithm descriptions and characteristics
  const algorithmInfo = {
    genetic: {
      name: 'Genetic Algorithm',
      description: 'Evolutionary optimization using selection, crossover, and mutation',
      strengths: [
        'Global optimization',
        'Handles complex parameter spaces',
        'Population diversity',
      ],
      convergenceRate: 'Medium',
      complexity: 'High',
      color: '#3B82F6',
    },
    particle_swarm: {
      name: 'Particle Swarm Optimization',
      description: 'Swarm intelligence inspired by bird flocking behavior',
      strengths: [
        'Fast convergence',
        'Good exploration-exploitation balance',
        'Simple implementation',
      ],
      convergenceRate: 'Fast',
      complexity: 'Medium',
      color: '#10B981',
    },
    gradient_descent: {
      name: 'Gradient Descent',
      description: 'Mathematical optimization using local gradients',
      strengths: ['Fast local convergence', 'Memory efficient', 'Mathematically sound'],
      convergenceRate: 'Very Fast',
      complexity: 'Low',
      color: '#F59E0B',
    },
    bayesian: {
      name: 'Bayesian Optimization',
      description: 'Sequential model-based optimization using Gaussian processes',
      strengths: ['Sample efficient', 'Uncertainty quantification', 'Global optimization'],
      convergenceRate: 'Medium',
      complexity: 'High',
      color: '#EF4444',
    },
    hybrid: {
      name: 'Hybrid Approach',
      description: 'Combines genetic algorithm with gradient descent refinement',
      strengths: ['Global + local optimization', 'Best of both worlds', 'Robust convergence'],
      convergenceRate: 'Medium',
      complexity: 'High',
      color: '#8B5CF6',
    },
  };

  // Start optimization
  const startOptimization = async () => {
    setIsRunning(true);
    setVisualization(null);
    setResult(null);

    try {
      const optimizationResult = await optimizationEngine.runOptimization(
        { ...optimizationRequest, algorithm: selectedAlgorithm },
        baseConfiguration,
        (viz) => setVisualization(viz)
      );

      setResult(optimizationResult);
      if (onOptimizationComplete) {
        onOptimizationComplete(optimizationResult);
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Stop optimization
  const stopOptimization = () => {
    optimizationEngine.stopOptimization();
    setIsRunning(false);
  };

  // Update objective weights
  const updateObjectiveWeight = (parameter: string, weight: number) => {
    setOptimizationRequest((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj) =>
        obj.parameter === parameter ? { ...obj, weight } : obj
      ),
    }));
  };

  // Normalize objective weights
  useEffect(() => {
    const totalWeight = optimizationRequest.objectives.reduce((sum, obj) => sum + obj.weight, 0);
    if (totalWeight !== 1.0 && totalWeight > 0) {
      setOptimizationRequest((prev) => ({
        ...prev,
        objectives: prev.objectives.map((obj) => ({
          ...obj,
          weight: obj.weight / totalWeight,
        })),
      }));
    }
  }, [optimizationRequest.objectives]);

  return (
    <div className="space-y-6">
      {/* Algorithm Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Algorithm</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(algorithmInfo).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedAlgorithm(key as OptimizationAlgorithm)}
              className={`p-4 text-left border-2 rounded-lg transition-all ${
                selectedAlgorithm === key
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900 mb-1">{info.name}</div>
              <div className="text-sm text-gray-600 mb-3">{info.description}</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Convergence:</span>
                  <Badge variant="info" className="text-xs">
                    {info.convergenceRate}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Complexity:</span>
                  <Badge variant="gray" className="text-xs">
                    {info.complexity}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            {algorithmInfo[selectedAlgorithm].name} Strengths:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {algorithmInfo[selectedAlgorithm].strengths.map((strength, index) => (
              <li key={index}>• {strength}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Optimization Objectives */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Objectives</h3>
        <div className="space-y-4">
          {optimizationRequest.objectives.map((objective, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900 capitalize">
                  {objective.parameter.replace('_', ' ')} ({objective.target})
                </div>
                <div className="text-sm text-gray-600">
                  Weight: {(objective.weight * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={objective.weight}
                  onChange={(e) =>
                    updateObjectiveWeight(objective.parameter, parseFloat(e.target.value))
                  }
                  className="w-24"
                />
                <div className="w-12 text-sm text-gray-600">
                  {(objective.weight * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Parameters */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Algorithm Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Iterations</label>
            <input
              type="number"
              value={optimizationRequest.maxIterations}
              onChange={(e) =>
                setOptimizationRequest((prev) => ({
                  ...prev,
                  maxIterations: parseInt(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              min="10"
              max="200"
            />
          </div>

          {(selectedAlgorithm === 'genetic' || selectedAlgorithm === 'particle_swarm') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Population Size
              </label>
              <input
                type="number"
                value={optimizationRequest.populationSize}
                onChange={(e) =>
                  setOptimizationRequest((prev) => ({
                    ...prev,
                    populationSize: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="10"
                max="100"
              />
            </div>
          )}

          {selectedAlgorithm === 'gradient_descent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Learning Rate</label>
              <input
                type="number"
                value={optimizationRequest.learningRate}
                onChange={(e) =>
                  setOptimizationRequest((prev) => ({
                    ...prev,
                    learningRate: parseFloat(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="0.001"
                max="0.1"
                step="0.001"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Convergence Threshold
            </label>
            <input
              type="number"
              value={optimizationRequest.convergenceThreshold}
              onChange={(e) =>
                setOptimizationRequest((prev) => ({
                  ...prev,
                  convergenceThreshold: parseFloat(e.target.value),
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              min="0.0001"
              max="0.01"
              step="0.0001"
            />
          </div>
        </div>
      </Card>

      {/* Control Buttons */}
      <div className="flex justify-center gap-4">
        {!isRunning ? (
          <Button onClick={startOptimization} className="px-8 py-3 text-lg">
            Start Optimization
          </Button>
        ) : (
          <Button onClick={stopOptimization} variant="outline" className="px-8 py-3 text-lg">
            Stop Optimization
          </Button>
        )}
      </div>

      {/* Real-time Visualization */}
      {visualization && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Optimization Progress - {algorithmInfo[visualization.algorithm].name}
            </h3>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  visualization.isRunning
                    ? 'warning'
                    : visualization.isComplete
                      ? 'success'
                      : 'error'
                }
              >
                {visualization.isRunning
                  ? 'Running'
                  : visualization.isComplete
                    ? 'Complete'
                    : 'Stopped'}
              </Badge>
              <div className="text-sm text-gray-600">
                Iteration: {visualization.currentIteration}
              </div>
            </div>
          </div>

          {/* Convergence Chart */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Convergence Progress</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visualization.convergenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bestFitness"
                  stroke={algorithmInfo[visualization.algorithm].color}
                  strokeWidth={2}
                  name="Best Fitness"
                />
                <Line
                  type="monotone"
                  dataKey="averageFitness"
                  stroke="#94A3B8"
                  strokeWidth={1}
                  name="Average Fitness"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Population Diversity (for population-based algorithms) */}
          {(visualization.algorithm === 'genetic' ||
            visualization.algorithm === 'particle_swarm') && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Population Diversity</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={visualization.convergenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="diversity"
                    stroke="#F59E0B"
                    fill="#FEF3C7"
                    name="Diversity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Parameter Evolution */}
          {visualization.convergenceData.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Parameter Evolution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={visualization.convergenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="parameters.temperature"
                    stroke="#EF4444"
                    name="Temperature"
                  />
                  <Line type="monotone" dataKey="parameters.ph" stroke="#3B82F6" name="pH" />
                  <Line
                    type="monotone"
                    dataKey="parameters.substrateConcetration"
                    stroke="#10B981"
                    name="Substrate"
                  />
                  <Line
                    type="monotone"
                    dataKey="parameters.flowRate"
                    stroke="#F59E0B"
                    name="Flow Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}

      {/* Optimization Results */}
      {result && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                +{result.performanceImprovement.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Performance Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{result.iterations}</div>
              <div className="text-sm text-gray-600">Iterations to Convergence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {result.convergenceTime.toFixed(1)}s
              </div>
              <div className="text-sm text-gray-600">Optimization Time</div>
            </div>
          </div>

          {/* Optimized Parameters */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Optimized Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Temperature</div>
                <div className="font-medium">
                  {result.optimalConfiguration.operatingConditions.temperature.toFixed(1)}°C
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">pH</div>
                <div className="font-medium">
                  {result.optimalConfiguration.operatingConditions.ph.toFixed(2)}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Substrate Concentration</div>
                <div className="font-medium">
                  {result.optimalConfiguration.operatingConditions.substrateConcetration.toFixed(0)}{' '}
                  mg/L
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Flow Rate</div>
                <div className="font-medium">
                  {result.optimalConfiguration.operatingConditions.flowRate.toFixed(2)} mL/min
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Electrical Load</div>
                <div className="font-medium">
                  {result.optimalConfiguration.operatingConditions.electricalLoad.toFixed(0)} Ω
                </div>
              </div>
            </div>
          </div>

          {/* Sensitivity Analysis */}
          {result.sensitivityAnalysis && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Parameter Sensitivity Analysis</h4>
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart data={result.sensitivityAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="sensitivity"
                    label={{ value: 'Sensitivity', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis
                    dataKey="importance"
                    label={{ value: 'Importance', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-medium">{data.parameter}</p>
                            <p>Sensitivity: {data.sensitivity.toFixed(3)}</p>
                            <p>Importance: {data.importance.toFixed(3)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="importance" fill="#3B82F6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
