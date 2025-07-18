'use client';

import React, { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@messai/ui';
import MESSViewer3D from './components/MESSViewer3D';
import ParameterControl, { sliderStyles } from './components/ParameterControl';
import LoadingStates from './components/LoadingStates';
import EnhancedNavigation from './components/EnhancedNavigation';
import RealTimeUpdates from './components/RealTimeUpdates';
import ExperimentsModule from './components/ExperimentsModule';
import ModelVersioning from './components/ModelVersioning';
import ToolsIntegrationPanel from './components/ToolsIntegrationPanel';

// Helper function for class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Parameter state interface
interface ModelParameters {
  // Geometry & Structure
  chamberLength: number;
  chamberWidth: number;
  chamberHeight: number;
  electrodeSpacing: number;
  membraneThickness: number;
  numberOfChambers: number;

  // Materials
  anodeMaterial: string;
  cathodeMaterial: string;
  membraneType: string;
  substrateMaterial: string;

  // Operating Conditions
  temperature: number;
  ph: number;
  flowRate: number;
  retentionTime: number;

  // Biological Parameters
  microbialSpecies: string;
  inoculumConcentration: number;
  biofilmThickness: number;

  // Electrical Configuration
  externalResistance: number;
  operatingVoltage: number;
  connectionType: string;

  // Environmental Settings
  ambientTemperature: number;
  oxygenAvailability: number;
  mixingSpeed: number;
}

const initialParameters: ModelParameters = {
  // Geometry & Structure
  chamberLength: 100,
  chamberWidth: 50,
  chamberHeight: 30,
  electrodeSpacing: 10,
  membraneThickness: 0.5,
  numberOfChambers: 1,

  // Materials
  anodeMaterial: 'carbon-cloth',
  cathodeMaterial: 'platinum',
  membraneType: 'nafion',
  substrateMaterial: 'glass',

  // Operating Conditions
  temperature: 25,
  ph: 7.0,
  flowRate: 10,
  retentionTime: 24,

  // Biological Parameters
  microbialSpecies: 'shewanella',
  inoculumConcentration: 1.0,
  biofilmThickness: 0.1,

  // Electrical Configuration
  externalResistance: 1000,
  operatingVoltage: 0.5,
  connectionType: 'single',

  // Environmental Settings
  ambientTemperature: 22,
  oxygenAvailability: 21,
  mixingSpeed: 100,
};

export default function LabIOPage() {
  const [selectedModel, setSelectedModel] = useState('algae');
  const [viewScale, setViewScale] = useState<'molecular' | 'system' | 'industrial'>('system');
  const [visualizationMode, setVisualizationMode] = useState<'static' | 'biofilm' | 'flow'>(
    'static'
  );
  const [parameters, setParameters] = useState<ModelParameters>(initialParameters);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    rendering: true,
    realTimeUpdates: false,
    interactiveControls: false,
  });

  // Simulate loading completion
  React.useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setSystemStatus({
        rendering: true,
        realTimeUpdates: true,
        interactiveControls: true,
      });
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  const updateParameter = (key: keyof ModelParameters, value: string | number) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLoadVersion = (versionParameters: Record<string, any>) => {
    setParameters(versionParameters as ModelParameters);
  };

  const models = [
    {
      id: 'microfluidic',
      name: 'Microfluidic Algal Fuel Cell',
      status: 'Available',
      statusType: 'default',
      description: 'Microscope slide chip with magnetic electrodes',
      version: '1.0',
    },
    {
      id: 'algae',
      name: 'Algae Fuel Cell Reactor',
      status: 'Available',
      statusType: 'default',
      description: 'High-precision algae bioreactor with Caladan Bio aesthetic',
      version: '1.0',
    },
    {
      id: 'stacked',
      name: 'Stacked Fuel Cell Slide Pile',
      status: 'Available',
      statusType: 'default',
      description: 'Series/parallel configurations',
      version: '1.0',
    },
    {
      id: 'benchtop',
      name: 'Benchtop Bioelectrochemical Reactor',
      status: 'In Development',
      statusType: 'outline',
      description: 'Lab experiments and culture cultivation',
      version: '0.9',
    },
    {
      id: 'industrial',
      name: 'Industrial Waste-to-Energy System',
      status: 'Concept',
      statusType: 'ghost',
      description: 'Large-scale brewery waste processing',
      version: '0.1',
    },
  ];

  if (isLoading) {
    return <LoadingStates />;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />

      {/* Enhanced Navigation */}
      <EnhancedNavigation />

      {/* Page Header */}
      <div className="grid-12 mb-8">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-responsive-xl font-serif font-light tracking-tight">
                MESSAi 3D Modeling Lab
              </h1>
              <p className="text-lg mt-4 opacity-60">
                Interactive visualization and real-time system modeling
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemStatus.rendering ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className={systemStatus.rendering ? 'text-green-600' : 'text-gray-500'}>
                  ✅ 3D Rendering Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemStatus.realTimeUpdates ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                />
                <span className={systemStatus.realTimeUpdates ? 'text-blue-600' : 'text-gray-500'}>
                  🔄 Real-time Updates
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemStatus.interactiveControls ? 'bg-purple-500' : 'bg-gray-400'
                  }`}
                />
                <span
                  className={systemStatus.interactiveControls ? 'text-purple-600' : 'text-gray-500'}
                >
                  🎮 Interactive Controls
                </span>
              </div>
              <Badge variant="outline" size="sm">
                v1.0
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid-12 gap-6 min-h-[600px]">
        {/* Left Column - Model Selection */}
        <div className="col-span-12 lg:col-span-3">
          <Card shadow={false} padding="sm" className="h-full">
            <h2 className="text-lg font-serif font-light mb-4">Model Catalog</h2>
            <div className="space-y-2">
              {models.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    'p-4 border cursor-pointer transition-all duration-300',
                    selectedModel === model.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-base">{model.name}</h3>
                        <Badge variant="ghost" size="sm">
                          v{model.version}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-60">{model.description}</p>
                    </div>
                    <Badge variant={model.statusType as any} size="sm">
                      {model.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* View Controls */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-serif mb-3">View Scale</h3>
              <div className="space-y-2">
                {(['molecular', 'system', 'industrial'] as const).map((scale) => (
                  <Button
                    key={scale}
                    variant={viewScale === scale ? 'primary' : 'ghost'}
                    size="sm"
                    fullWidth
                    onClick={() => setViewScale(scale)}
                    className="justify-start"
                  >
                    {scale.charAt(0).toUpperCase() + scale.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Visualization Mode */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-serif mb-3">Visualization</h3>
              <div className="space-y-2">
                {(['static', 'biofilm', 'flow'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={visualizationMode === mode ? 'primary' : 'ghost'}
                    size="sm"
                    fullWidth
                    onClick={() => setVisualizationMode(mode)}
                    className="justify-start"
                  >
                    {mode === 'biofilm'
                      ? 'Biofilm Simulation'
                      : mode === 'flow'
                      ? 'Flow Patterns'
                      : 'Static Model'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Center Column - 3D Viewer */}
        <div className="col-span-12 lg:col-span-6">
          <Card shadow={false} padding="none" className="h-full min-h-[600px]">
            <div className="relative w-full h-full">
              <MESSViewer3D
                className="w-full h-full"
                selectedModel={selectedModel}
                viewScale={viewScale}
                visualizationMode={visualizationMode}
              />
              {/* Experiments Module Overlay */}
              <ExperimentsModule />
            </div>
          </Card>
        </div>

        {/* Right Column - Parameter Controls */}
        <div className="col-span-12 lg:col-span-3">
          <Card shadow={false} padding="sm" className="h-full overflow-y-auto">
            <h2 className="text-lg font-serif font-light mb-4">Parameters</h2>

            <Accordion type="single" defaultValue="geometry" className="space-y-0">
              {/* Geometry & Structure */}
              <AccordionItem value="geometry">
                <AccordionTrigger>Geometry & Structure</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ParameterControl
                      label="Chamber Length"
                      value={parameters.chamberLength}
                      onChange={(v) => updateParameter('chamberLength', v)}
                      type="number"
                      unit="mm"
                      min={10}
                      max={500}
                    />
                    <ParameterControl
                      label="Chamber Width"
                      value={parameters.chamberWidth}
                      onChange={(v) => updateParameter('chamberWidth', v)}
                      type="number"
                      unit="mm"
                      min={10}
                      max={300}
                    />
                    <ParameterControl
                      label="Chamber Height"
                      value={parameters.chamberHeight}
                      onChange={(v) => updateParameter('chamberHeight', v)}
                      type="number"
                      unit="mm"
                      min={5}
                      max={100}
                    />
                    <ParameterControl
                      label="Electrode Spacing"
                      value={parameters.electrodeSpacing}
                      onChange={(v) => updateParameter('electrodeSpacing', v)}
                      type="range"
                      unit="mm"
                      min={1}
                      max={50}
                      step={0.5}
                    />
                    <ParameterControl
                      label="Membrane Thickness"
                      value={parameters.membraneThickness}
                      onChange={(v) => updateParameter('membraneThickness', v)}
                      type="number"
                      unit="mm"
                      min={0.1}
                      max={5}
                      step={0.1}
                    />
                    <ParameterControl
                      label="Number of Chambers"
                      value={parameters.numberOfChambers}
                      onChange={(v) => updateParameter('numberOfChambers', v)}
                      type="number"
                      min={1}
                      max={10}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Materials */}
              <AccordionItem value="materials">
                <AccordionTrigger>Materials</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ParameterControl
                      label="Anode Material"
                      value={parameters.anodeMaterial}
                      onChange={(v) => updateParameter('anodeMaterial', v)}
                      type="select"
                      options={[
                        { value: 'carbon-cloth', label: 'Carbon Cloth' },
                        { value: 'carbon-paper', label: 'Carbon Paper' },
                        { value: 'graphite', label: 'Graphite' },
                        { value: 'carbon-felt', label: 'Carbon Felt' },
                      ]}
                    />
                    <ParameterControl
                      label="Cathode Material"
                      value={parameters.cathodeMaterial}
                      onChange={(v) => updateParameter('cathodeMaterial', v)}
                      type="select"
                      options={[
                        { value: 'platinum', label: 'Platinum' },
                        { value: 'carbon-pt', label: 'Carbon + Pt' },
                        { value: 'mno2', label: 'MnO₂' },
                        { value: 'carbon', label: 'Plain Carbon' },
                      ]}
                    />
                    <ParameterControl
                      label="Membrane Type"
                      value={parameters.membraneType}
                      onChange={(v) => updateParameter('membraneType', v)}
                      type="select"
                      options={[
                        { value: 'nafion', label: 'Nafion' },
                        { value: 'ultrex', label: 'Ultrex' },
                        { value: 'cation', label: 'CEM' },
                        { value: 'anion', label: 'AEM' },
                      ]}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Operating Conditions */}
              <AccordionItem value="operating">
                <AccordionTrigger>Operating Conditions</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ParameterControl
                      label="Temperature"
                      value={parameters.temperature}
                      onChange={(v) => updateParameter('temperature', v)}
                      type="range"
                      unit="°C"
                      min={15}
                      max={40}
                      step={0.5}
                    />
                    <ParameterControl
                      label="pH Level"
                      value={parameters.ph}
                      onChange={(v) => updateParameter('ph', v)}
                      type="range"
                      min={5}
                      max={9}
                      step={0.1}
                    />
                    <ParameterControl
                      label="Flow Rate"
                      value={parameters.flowRate}
                      onChange={(v) => updateParameter('flowRate', v)}
                      type="number"
                      unit="mL/min"
                      min={0}
                      max={100}
                    />
                    <ParameterControl
                      label="Retention Time"
                      value={parameters.retentionTime}
                      onChange={(v) => updateParameter('retentionTime', v)}
                      type="number"
                      unit="hours"
                      min={1}
                      max={72}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Biological Parameters */}
              <AccordionItem value="biological">
                <AccordionTrigger>Biological Parameters</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ParameterControl
                      label="Microbial Species"
                      value={parameters.microbialSpecies}
                      onChange={(v) => updateParameter('microbialSpecies', v)}
                      type="select"
                      options={[
                        { value: 'shewanella', label: 'Shewanella oneidensis' },
                        { value: 'geobacter', label: 'Geobacter sulfurreducens' },
                        { value: 'mixed', label: 'Mixed Culture' },
                        { value: 'algae', label: 'Algae Consortium' },
                      ]}
                    />
                    <ParameterControl
                      label="Inoculum Concentration"
                      value={parameters.inoculumConcentration}
                      onChange={(v) => updateParameter('inoculumConcentration', v)}
                      type="number"
                      unit="g/L"
                      min={0.1}
                      max={10}
                      step={0.1}
                    />
                    <ParameterControl
                      label="Target Biofilm Thickness"
                      value={parameters.biofilmThickness}
                      onChange={(v) => updateParameter('biofilmThickness', v)}
                      type="range"
                      unit="mm"
                      min={0.01}
                      max={1}
                      step={0.01}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Electrical Configuration */}
              <AccordionItem value="electrical">
                <AccordionTrigger>Electrical Configuration</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ParameterControl
                      label="External Resistance"
                      value={parameters.externalResistance}
                      onChange={(v) => updateParameter('externalResistance', v)}
                      type="number"
                      unit="Ω"
                      min={10}
                      max={10000}
                    />
                    <ParameterControl
                      label="Operating Voltage"
                      value={parameters.operatingVoltage}
                      onChange={(v) => updateParameter('operatingVoltage', v)}
                      type="number"
                      unit="V"
                      min={0}
                      max={2}
                      step={0.1}
                    />
                    <ParameterControl
                      label="Connection Type"
                      value={parameters.connectionType}
                      onChange={(v) => updateParameter('connectionType', v)}
                      type="select"
                      options={[
                        { value: 'single', label: 'Single Cell' },
                        { value: 'series', label: 'Series' },
                        { value: 'parallel', label: 'Parallel' },
                        { value: 'mixed', label: 'Series-Parallel' },
                      ]}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Environmental Settings */}
              <AccordionItem value="environmental">
                <AccordionTrigger>Environmental Settings</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <ParameterControl
                      label="Ambient Temperature"
                      value={parameters.ambientTemperature}
                      onChange={(v) => updateParameter('ambientTemperature', v)}
                      type="range"
                      unit="°C"
                      min={10}
                      max={35}
                    />
                    <ParameterControl
                      label="Oxygen Availability"
                      value={parameters.oxygenAvailability}
                      onChange={(v) => updateParameter('oxygenAvailability', v)}
                      type="range"
                      unit="%"
                      min={0}
                      max={100}
                    />
                    <ParameterControl
                      label="Mixing Speed"
                      value={parameters.mixingSpeed}
                      onChange={(v) => updateParameter('mixingSpeed', v)}
                      type="number"
                      unit="RPM"
                      min={0}
                      max={500}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Enhanced Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <Button variant="primary" fullWidth>
                Run Simulation
              </Button>
              <Button variant="secondary" fullWidth>
                Export Configuration
              </Button>
              <Button variant="outline" fullWidth>
                Save to Library
              </Button>
              <Button variant="ghost" fullWidth>
                Reset Parameters
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Real-time Updates Component */}
      <RealTimeUpdates />

      {/* Model Versioning Component */}
      <ModelVersioning currentParameters={parameters} onLoadVersion={handleLoadVersion} />

      {/* Tools Integration Panel */}
      <ToolsIntegrationPanel />
    </>
  );
}
