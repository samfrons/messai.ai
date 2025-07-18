'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Badge, Input } from '@messai/ui';
import type {
  PredictionConfiguration,
  OperatingConditions,
  PredictionState,
} from '../../types/predictions';
import {
  SYSTEM_CONFIGURATIONS,
  ELECTRODE_MATERIALS,
  MICROBIAL_SPECIES,
  PRESET_CONFIGURATIONS,
  VALIDATION_CONSTRAINTS,
  PARAMETER_UNITS,
  SUBSTRATE_TYPES,
} from '../../data/prediction-constants';

interface PredictionConfigurationFormProps {
  onGenerate: (config: PredictionConfiguration) => void;
  isLoading?: boolean;
  predictionState?: PredictionState | undefined;
}

interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export default function PredictionConfigurationForm({
  onGenerate,
  isLoading = false,
  predictionState,
}: PredictionConfigurationFormProps) {
  // Form state
  const [selectedSystemConfig, setSelectedSystemConfig] = useState(SYSTEM_CONFIGURATIONS[0]);
  const [selectedAnodeMaterial, setSelectedAnodeMaterial] = useState(ELECTRODE_MATERIALS[0]);
  const [selectedCathodeMaterial, setSelectedCathodeMaterial] = useState(ELECTRODE_MATERIALS[0]);
  const [selectedMicrobialSpecies, setSelectedMicrobialSpecies] = useState(MICROBIAL_SPECIES[0]);
  const [operatingConditions, setOperatingConditions] = useState<OperatingConditions>({
    temperature: 30,
    ph: 7.2,
    substrateConcetration: 500,
    flowRate: 2.0,
    electricalLoad: 1000,
    duration: 168,
  });
  const [selectedSubstrateType, setSelectedSubstrateType] = useState(SUBSTRATE_TYPES[1]);
  const [configurationName, setConfigurationName] = useState('Custom Configuration');
  const [validation, setValidation] = useState<FormValidation>({
    isValid: true,
    errors: {},
    warnings: {},
  });

  // Validation logic
  const validateConfiguration = useCallback(() => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // Temperature validation
    if (
      operatingConditions.temperature < VALIDATION_CONSTRAINTS.temperature.min ||
      operatingConditions.temperature > VALIDATION_CONSTRAINTS.temperature.max
    ) {
      errors['temperature'] =
        `Temperature must be between ${VALIDATION_CONSTRAINTS.temperature.min}-${VALIDATION_CONSTRAINTS.temperature.max}°C`;
    } else if (
      selectedMicrobialSpecies &&
      (operatingConditions.temperature < selectedMicrobialSpecies.temperatureRange[0] ||
        operatingConditions.temperature > selectedMicrobialSpecies.temperatureRange[1])
    ) {
      warnings['temperature'] =
        `Temperature outside optimal range for ${selectedMicrobialSpecies.name} (${selectedMicrobialSpecies.temperatureRange[0]}-${selectedMicrobialSpecies.temperatureRange[1]}°C)`;
    }

    // pH validation
    if (
      operatingConditions.ph < VALIDATION_CONSTRAINTS.ph.min ||
      operatingConditions.ph > VALIDATION_CONSTRAINTS.ph.max
    ) {
      errors['ph'] =
        `pH must be between ${VALIDATION_CONSTRAINTS.ph.min}-${VALIDATION_CONSTRAINTS.ph.max}`;
    } else if (
      selectedMicrobialSpecies &&
      (operatingConditions.ph < selectedMicrobialSpecies.phRange[0] ||
        operatingConditions.ph > selectedMicrobialSpecies.phRange[1])
    ) {
      warnings['ph'] =
        `pH outside optimal range for ${selectedMicrobialSpecies.name} (${selectedMicrobialSpecies.phRange[0]}-${selectedMicrobialSpecies.phRange[1]})`;
    }

    // Substrate concentration validation
    if (
      operatingConditions.substrateConcetration <
        VALIDATION_CONSTRAINTS.substrateConcentration.min ||
      operatingConditions.substrateConcetration > VALIDATION_CONSTRAINTS.substrateConcentration.max
    ) {
      errors['substrateConcetration'] =
        `Substrate concentration must be between ${VALIDATION_CONSTRAINTS.substrateConcentration.min}-${VALIDATION_CONSTRAINTS.substrateConcentration.max} mg/L`;
    } else if (
      selectedSubstrateType &&
      selectedSubstrateType.concentration &&
      selectedSubstrateType.concentration.length >= 2
    ) {
      const [min, max] = selectedSubstrateType.concentration as [number, number];
      if (
        operatingConditions.substrateConcetration < min ||
        operatingConditions.substrateConcetration > max
      ) {
        warnings['substrateConcetration'] =
          `Concentration outside typical range for ${selectedSubstrateType.name} (${min}-${max} mg/L)`;
      }
    }

    // Flow rate validation
    if (
      operatingConditions.flowRate < VALIDATION_CONSTRAINTS.flowRate.min ||
      operatingConditions.flowRate > VALIDATION_CONSTRAINTS.flowRate.max
    ) {
      errors['flowRate'] =
        `Flow rate must be between ${VALIDATION_CONSTRAINTS.flowRate.min}-${VALIDATION_CONSTRAINTS.flowRate.max} mL/min`;
    }

    // Electrical load validation
    if (
      operatingConditions.electricalLoad < VALIDATION_CONSTRAINTS.electricalLoad.min ||
      operatingConditions.electricalLoad > VALIDATION_CONSTRAINTS.electricalLoad.max
    ) {
      errors['electricalLoad'] =
        `Electrical load must be between ${VALIDATION_CONSTRAINTS.electricalLoad.min}-${VALIDATION_CONSTRAINTS.electricalLoad.max} Ω`;
    }

    // Duration validation
    if (
      operatingConditions.duration < VALIDATION_CONSTRAINTS.duration.min ||
      operatingConditions.duration > VALIDATION_CONSTRAINTS.duration.max
    ) {
      errors['duration'] =
        `Duration must be between ${VALIDATION_CONSTRAINTS.duration.min}-${VALIDATION_CONSTRAINTS.duration.max} hours`;
    }

    // Material compatibility warnings
    if (selectedAnodeMaterial && selectedAnodeMaterial.biocompatibility < 0.7) {
      warnings['anodeMaterial'] =
        'Selected anode material has low biocompatibility - may reduce performance';
    }

    if (selectedCathodeMaterial && selectedCathodeMaterial.conductivity < 800) {
      warnings['cathodeMaterial'] =
        'Selected cathode material has low conductivity - may limit current output';
    }

    // System-specific warnings
    if (
      selectedSystemConfig &&
      selectedSystemConfig.type === 'microfluidic_algal' &&
      operatingConditions.flowRate > 0.5
    ) {
      warnings['flowRate'] = 'High flow rate may cause cell washing in microfluidic systems';
    }

    if (
      selectedSystemConfig &&
      selectedSystemConfig.type === 'industrial_scale' &&
      operatingConditions.duration < 720
    ) {
      warnings['duration'] =
        'Industrial systems typically require longer operation periods for meaningful analysis';
    }

    const isValid = Object.keys(errors).length === 0;
    setValidation({ isValid, errors, warnings });
  }, [
    operatingConditions,
    selectedMicrobialSpecies,
    selectedAnodeMaterial,
    selectedCathodeMaterial,
    selectedSystemConfig,
    selectedSubstrateType,
  ]);

  // Validate on changes
  useEffect(() => {
    validateConfiguration();
  }, [validateConfiguration]);

  // Handle parameter changes
  const handleParameterChange = (parameter: keyof OperatingConditions, value: number) => {
    setOperatingConditions((prev) => ({
      ...prev,
      [parameter]: value,
    }));
  };

  // Load preset configuration
  const loadPreset = (presetId: string) => {
    const preset = PRESET_CONFIGURATIONS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedSystemConfig(preset.configuration.systemConfig);
      setSelectedAnodeMaterial(preset.configuration.anodeMaterial);
      setSelectedCathodeMaterial(preset.configuration.cathodeMaterial);
      setSelectedMicrobialSpecies(preset.configuration.microbialSpecies);
      setOperatingConditions(preset.configuration.operatingConditions);
      setConfigurationName(preset.name);
    }
  };

  // Generate prediction
  const handleGenerate = () => {
    if (!validation.isValid) return;
    if (
      !selectedSystemConfig ||
      !selectedAnodeMaterial ||
      !selectedCathodeMaterial ||
      !selectedMicrobialSpecies
    ) {
      return;
    }

    const config: PredictionConfiguration = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: configurationName,
      systemConfig: selectedSystemConfig,
      anodeMaterial: selectedAnodeMaterial,
      cathodeMaterial: selectedCathodeMaterial,
      microbialSpecies: selectedMicrobialSpecies,
      operatingConditions,
      createdAt: new Date(),
      userId: 'current_user',
    };

    onGenerate(config);
  };

  // Render validation message
  const renderValidationMessage = (field: string, type: 'error' | 'warning') => {
    const messages = type === 'error' ? validation.errors : validation.warnings;
    const message = messages[field];
    if (!message) return null;

    return (
      <div className={`text-xs mt-1 ${type === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
        {message}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preset Configurations */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Presets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_CONFIGURATIONS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset.id)}
              className="p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">{preset.name}</div>
              <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
              <div className="flex items-center mt-2">
                <Badge
                  variant={
                    preset.category === 'research'
                      ? 'primary'
                      : preset.category === 'educational'
                        ? 'secondary'
                        : 'info'
                  }
                  className="text-xs"
                >
                  {preset.category}
                </Badge>
                <div className="text-xs text-gray-500 ml-2">★ {preset.rating}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Name
              </label>
              <Input
                value={configurationName}
                onChange={(e) => setConfigurationName(e.target.value)}
                placeholder="Enter configuration name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System Type</label>
              <select
                value={selectedSystemConfig?.id || ''}
                onChange={(e) =>
                  setSelectedSystemConfig(
                    SYSTEM_CONFIGURATIONS.find((s) => s.id === e.target.value)!
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {SYSTEM_CONFIGURATIONS.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-600 mt-1">
                {selectedSystemConfig?.description || ''}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anode Material</label>
              <select
                value={selectedAnodeMaterial?.id || ''}
                onChange={(e) =>
                  setSelectedAnodeMaterial(
                    ELECTRODE_MATERIALS.find((m) => m.id === e.target.value)!
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {ELECTRODE_MATERIALS.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name} (σ: {material.conductivity} S/m, ${material.cost}/kg)
                  </option>
                ))}
              </select>
              {renderValidationMessage('anodeMaterial', 'warning')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cathode Material
              </label>
              <select
                value={selectedCathodeMaterial?.id || ''}
                onChange={(e) =>
                  setSelectedCathodeMaterial(
                    ELECTRODE_MATERIALS.find((m) => m.id === e.target.value)!
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {ELECTRODE_MATERIALS.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name} (σ: {material.conductivity} S/m, ${material.cost}/kg)
                  </option>
                ))}
              </select>
              {renderValidationMessage('cathodeMaterial', 'warning')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microbial Species
              </label>
              <select
                value={selectedMicrobialSpecies?.id || ''}
                onChange={(e) =>
                  setSelectedMicrobialSpecies(
                    MICROBIAL_SPECIES.find((s) => s.id === e.target.value)!
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {MICROBIAL_SPECIES.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.name} (T: {species.temperatureRange[0]}-{species.temperatureRange[1]}
                    °C)
                  </option>
                ))}
              </select>
              <div className="text-xs text-gray-600 mt-1">
                Optimal pH: {selectedMicrobialSpecies?.phRange?.[0] || 'N/A'}-
                {selectedMicrobialSpecies?.phRange?.[1] || 'N/A'}
              </div>
            </div>
          </div>
        </Card>

        {/* Operating Conditions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operating Conditions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature ({PARAMETER_UNITS.temperature})
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={VALIDATION_CONSTRAINTS.temperature.min}
                  max={VALIDATION_CONSTRAINTS.temperature.max}
                  value={operatingConditions.temperature}
                  onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={operatingConditions.temperature}
                  onChange={(e) =>
                    handleParameterChange('temperature', parseFloat(e.target.value) || 0)
                  }
                  className="w-20"
                  min={VALIDATION_CONSTRAINTS.temperature.min}
                  max={VALIDATION_CONSTRAINTS.temperature.max}
                />
              </div>
              {renderValidationMessage('temperature', 'error')}
              {renderValidationMessage('temperature', 'warning')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                pH ({PARAMETER_UNITS.ph})
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={VALIDATION_CONSTRAINTS.ph.min}
                  max={VALIDATION_CONSTRAINTS.ph.max}
                  step="0.1"
                  value={operatingConditions.ph}
                  onChange={(e) => handleParameterChange('ph', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={operatingConditions.ph}
                  onChange={(e) => handleParameterChange('ph', parseFloat(e.target.value) || 0)}
                  className="w-20"
                  step="0.1"
                  min={VALIDATION_CONSTRAINTS.ph.min}
                  max={VALIDATION_CONSTRAINTS.ph.max}
                />
              </div>
              {renderValidationMessage('ph', 'error')}
              {renderValidationMessage('ph', 'warning')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Substrate Type</label>
              <select
                value={selectedSubstrateType?.id || ''}
                onChange={(e) =>
                  setSelectedSubstrateType(SUBSTRATE_TYPES.find((s) => s.id === e.target.value)!)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                {SUBSTRATE_TYPES.map((substrate) => (
                  <option key={substrate.id} value={substrate.id}>
                    {substrate.name} (Typical: {substrate.concentration[0]}-
                    {substrate.concentration[1]} mg/L)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Substrate Concentration ({PARAMETER_UNITS.substrateConcentration})
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={VALIDATION_CONSTRAINTS.substrateConcentration.min}
                  max={VALIDATION_CONSTRAINTS.substrateConcentration.max}
                  value={operatingConditions.substrateConcetration}
                  onChange={(e) =>
                    handleParameterChange('substrateConcetration', parseFloat(e.target.value))
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={operatingConditions.substrateConcetration}
                  onChange={(e) =>
                    handleParameterChange('substrateConcetration', parseFloat(e.target.value) || 0)
                  }
                  className="w-24"
                  min={VALIDATION_CONSTRAINTS.substrateConcentration.min}
                  max={VALIDATION_CONSTRAINTS.substrateConcentration.max}
                />
              </div>
              {renderValidationMessage('substrateConcetration', 'error')}
              {renderValidationMessage('substrateConcetration', 'warning')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flow Rate ({PARAMETER_UNITS.flowRate})
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={VALIDATION_CONSTRAINTS.flowRate.min}
                  max={Math.min(100, VALIDATION_CONSTRAINTS.flowRate.max)}
                  step="0.1"
                  value={operatingConditions.flowRate}
                  onChange={(e) => handleParameterChange('flowRate', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={operatingConditions.flowRate}
                  onChange={(e) =>
                    handleParameterChange('flowRate', parseFloat(e.target.value) || 0)
                  }
                  className="w-24"
                  step="0.1"
                  min={VALIDATION_CONSTRAINTS.flowRate.min}
                  max={VALIDATION_CONSTRAINTS.flowRate.max}
                />
              </div>
              {renderValidationMessage('flowRate', 'error')}
              {renderValidationMessage('flowRate', 'warning')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Electrical Load ({PARAMETER_UNITS.electricalLoad})
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={VALIDATION_CONSTRAINTS.electricalLoad.min}
                  max={Math.min(5000, VALIDATION_CONSTRAINTS.electricalLoad.max)}
                  value={operatingConditions.electricalLoad}
                  onChange={(e) =>
                    handleParameterChange('electricalLoad', parseFloat(e.target.value))
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={operatingConditions.electricalLoad}
                  onChange={(e) =>
                    handleParameterChange('electricalLoad', parseFloat(e.target.value) || 0)
                  }
                  className="w-24"
                  min={VALIDATION_CONSTRAINTS.electricalLoad.min}
                  max={VALIDATION_CONSTRAINTS.electricalLoad.max}
                />
              </div>
              {renderValidationMessage('electricalLoad', 'error')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration ({PARAMETER_UNITS.duration})
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={VALIDATION_CONSTRAINTS.duration.min}
                  max={Math.min(1000, VALIDATION_CONSTRAINTS.duration.max)}
                  value={operatingConditions.duration}
                  onChange={(e) => handleParameterChange('duration', parseFloat(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={operatingConditions.duration}
                  onChange={(e) =>
                    handleParameterChange('duration', parseFloat(e.target.value) || 0)
                  }
                  className="w-24"
                  min={VALIDATION_CONSTRAINTS.duration.min}
                  max={VALIDATION_CONSTRAINTS.duration.max}
                />
              </div>
              {renderValidationMessage('duration', 'error')}
              {renderValidationMessage('duration', 'warning')}
            </div>
          </div>
        </Card>
      </div>

      {/* Prediction Progress */}
      {predictionState && predictionState.isLoading && (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{predictionState.message}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${predictionState.progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {predictionState.progress}% complete
              {predictionState.estimatedTimeRemaining && (
                <span>
                  {' '}
                  • {Math.round(predictionState.estimatedTimeRemaining)} seconds remaining
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex items-center justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!validation.isValid || isLoading}
          className="px-8 py-3 text-lg"
        >
          {isLoading ? 'Generating Prediction...' : 'Generate AI Prediction'}
        </Button>
      </div>

      {/* Validation Summary */}
      {(Object.keys(validation.errors).length > 0 ||
        Object.keys(validation.warnings).length > 0) && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuration Analysis</h3>

          {Object.keys(validation.errors).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">Errors (must be fixed):</h4>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.values(validation.errors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(validation.warnings).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-700 mb-2">
                Warnings (may affect performance):
              </h4>
              <ul className="text-sm text-yellow-600 space-y-1">
                {Object.values(validation.warnings).map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
