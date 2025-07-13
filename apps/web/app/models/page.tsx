'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@messai/ui/components'

// Dynamically import 3D components to avoid SSR issues
const Scene = dynamic(() => import('../../components/3d/Scene'), { ssr: false })
const MicrofluidicChip = dynamic(() => import('../../components/3d/MicrofluidicChip'), { ssr: false })

const MODEL_TYPES = [
  {
    id: 'microfluidic',
    name: 'Microfluidic Chip',
    description: 'Microscope slide chip with magnetic electrodes and hydrogel membrane',
    available: true,
  },
  {
    id: 'stacked',
    name: 'Stacked Fuel Cell',
    description: 'Multiple slides in series/parallel for increased current/voltage',
    available: false,
  },
  {
    id: 'benchtop',
    name: 'Benchtop Bioreactor',
    description: 'Laboratory-scale reactor for experiments and culture cultivation',
    available: false,
  },
  {
    id: 'industrial',
    name: 'Industrial System',
    description: 'Large-scale waste-to-energy system for brewery applications',
    available: false,
  },
]

export default function ModelsPage() {
  const [selectedModel, setSelectedModel] = useState('microfluidic')

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          MESS 3D Models
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Interactive visualization of microbial electrochemical systems
        </p>
      </div>

      {/* Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODEL_TYPES.map((model) => (
          <Card 
            key={model.id}
            className={`cursor-pointer transition-all ${
              selectedModel === model.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedModel(model.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{model.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{model.description}</p>
              {!model.available && (
                <p className="text-xs text-orange-600 mt-2">Coming Soon</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3D Visualization */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Microfluidic Chip - 3D Model</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Reset View
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm">
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedModel === 'microfluidic' ? (
            <Suspense fallback={<div>Loading 3D model...</div>}>
              <Scene>
                <MicrofluidicChip />
              </Scene>
            </Suspense>
          ) : (
            <div className="w-full h-[600px] bg-gray-100 rounded-lg border flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-700">
                  {MODEL_TYPES.find(m => m.id === selectedModel)?.name} Model
                </h3>
                <p className="text-gray-500 mt-2">Coming Soon</p>
                <p className="text-sm text-gray-400 mt-1">
                  This model is currently under development
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Information */}
      {selectedModel === 'microfluidic' && (
        <Card>
          <CardHeader>
            <CardTitle>Microfluidic Chip Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900">Dimensions</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>Length: 76mm (standard slide)</li>
                  <li>Width: 26mm</li>
                  <li>Thickness: 1mm</li>
                  <li>Chamber volume: 100μL each</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Materials</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>Substrate: Borosilicate glass</li>
                  <li>Electrodes: Carbon fiber</li>
                  <li>Membrane: Nafion 117</li>
                  <li>Channels: PDMS</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Performance</h4>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>Max power: 2.5 mW/m²</li>
                  <li>Coulombic efficiency: 85%</li>
                  <li>Operating pH: 6.5-7.5</li>
                  <li>Temperature: 25-35°C</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900">Mouse Controls</h4>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Left click + drag: Rotate view</li>
                <li>• Right click + drag: Pan view</li>
                <li>• Scroll wheel: Zoom in/out</li>
                <li>• Click object: Select/highlight</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Components</h4>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Red chamber: Anode compartment</li>
                <li>• Blue chamber: Cathode compartment</li>
                <li>• Yellow membrane: Ion exchange</li>
                <li>• Black rods: Carbon electrodes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Features</h4>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• Real-time 3D rendering</li>
                <li>• Interactive object selection</li>
                <li>• Component highlighting</li>
                <li>• Educational labels</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}