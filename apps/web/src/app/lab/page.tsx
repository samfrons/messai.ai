'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@messai/ui';
import MESSViewer3D from './components/MESSViewer3D';

export default function LabPage() {
  const [selectedModel, setSelectedModel] = useState('microfluidic');
  const [viewScale, setViewScale] = useState<'molecular' | 'system' | 'industrial'>('system');
  const [visualizationMode, setVisualizationMode] = useState<'static' | 'biofilm' | 'flow'>(
    'static'
  );

  const models = [
    {
      id: 'microfluidic',
      name: 'Microfluidic Algal Fuel Cell',
      status: 'Available',
      type: 'primary',
      description: 'Microscope slide chip with magnetic electrodes and hydrogel membrane',
    },
    {
      id: 'stacked',
      name: 'Stacked Fuel Cell Slide Pile',
      status: 'Available',
      type: 'primary',
      description: 'Series/parallel configurations for increased current and voltage',
    },
    {
      id: 'benchtop',
      name: 'Benchtop Bioelectrochemical Reactor',
      status: 'In Development',
      type: 'warning',
      description: 'Lab experiments and culture cultivation setup',
    },
    {
      id: 'industrial',
      name: 'Industrial Waste-to-Energy System',
      status: 'Concept',
      type: 'gray',
      description: 'Large-scale brewery waste processing system',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">3D Modeling Laboratory</h1>
        <p className="text-gray-600 mt-2">
          Interactive Three.js-powered visualization and real-time system modeling
        </p>
      </div>

      {/* 3D Viewer */}
      <Card className="p-0 overflow-hidden">
        <MESSViewer3D
          className="min-h-[500px]"
          selectedModel={selectedModel}
          viewScale={viewScale}
          visualizationMode={visualizationMode}
        />
      </Card>

      {/* Model Catalog and Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">MESS Model Catalog</h2>
          <div className="space-y-3">
            {models.map((model) => (
              <div
                key={model.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedModel === model.id
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedModel(model.id)}
              >
                <div>
                  <h3 className="font-medium text-gray-900">{model.name}</h3>
                  <p className="text-sm text-gray-600">{model.description}</p>
                </div>
                <Badge variant={model.type as any}>{model.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Controls</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View Scale</label>
              <div className="flex gap-2">
                {(['molecular', 'system', 'industrial'] as const).map((scale) => (
                  <Button
                    key={scale}
                    variant={viewScale === scale ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewScale(scale)}
                  >
                    {scale.charAt(0).toUpperCase() + scale.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visualization Mode
              </label>
              <div className="flex gap-2">
                {(['static', 'biofilm', 'flow'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={visualizationMode === mode ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setVisualizationMode(mode)}
                  >
                    {mode === 'biofilm'
                      ? 'Biofilm Sim'
                      : mode === 'flow'
                      ? 'Flow Patterns'
                      : 'Static'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Tools</label>
              <div className="space-y-2">
                <Button variant="ghost" fullWidth className="justify-start">
                  Real-time Cost Analysis
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  Performance Metrics
                </Button>
                <Button variant="ghost" fullWidth className="justify-start">
                  Material Compatibility
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Laboratory Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Real-time Rendering</h3>
            <p className="text-sm text-gray-600 mt-1">Three.js-powered system visualization</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-secondary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900">Dynamic Simulation</h3>
            <p className="text-sm text-gray-600 mt-1">Animated substrate and electron flow</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-accent-600"
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
            <h3 className="font-medium text-gray-900">Performance Analysis</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time efficiency and cost calculations</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
