import React from 'react';
import { Card, Badge, Button } from '@messai/ui';
import type { Parameter } from '../../../types/parameters';

interface ParameterCardProps {
  parameter: Parameter;
  onSelect: () => void;
}

export default function ParameterCard({ parameter, onSelect }: ParameterCardProps) {
  // Format category for display
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get badge variant based on category
  const getCategoryVariant = (category: string) => {
    const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error'> = {
      electrode: 'primary',
      microbe: 'success',
      substrate: 'warning',
      operating_condition: 'secondary',
      system_configuration: 'primary',
      membrane: 'secondary',
      separator: 'secondary',
    };
    return variants[category] || 'secondary';
  };

  // Get key properties to display based on category
  const getKeyProperties = () => {
    const props = parameter.properties;
    const displayProps: Array<{ label: string; value: string | number; unit?: string }> = [];

    switch (parameter.category) {
      case 'electrode':
        if (props.conductivity !== undefined) {
          displayProps.push({ label: 'Conductivity', value: props.conductivity, unit: 'S/m' });
        }
        if (props.surfaceArea !== undefined) {
          displayProps.push({ label: 'Surface Area', value: props.surfaceArea, unit: 'm²/g' });
        }
        if (props.cost !== undefined) {
          displayProps.push({ label: 'Cost', value: `$${props.cost}`, unit: '/kg' });
        }
        break;
      case 'microbe':
        if (props.electronTransferRate !== undefined) {
          displayProps.push({
            label: 'Electron Transfer',
            value: props.electronTransferRate.toExponential(2),
            unit: 'e⁻/s',
          });
        }
        if (props.optimalTemperature !== undefined) {
          displayProps.push({ label: 'Optimal Temp', value: props.optimalTemperature, unit: '°C' });
        }
        if (props.optimalPH !== undefined) {
          displayProps.push({ label: 'Optimal pH', value: props.optimalPH });
        }
        break;
      case 'substrate':
        if (props.concentration !== undefined) {
          displayProps.push({ label: 'Concentration', value: props.concentration, unit: 'g/L' });
        }
        if (props.cod !== undefined) {
          displayProps.push({ label: 'COD', value: props.cod, unit: 'mg/L' });
        }
        break;
      case 'operating_condition':
        if (props.temperature !== undefined) {
          displayProps.push({ label: 'Temperature', value: props.temperature, unit: '°C' });
        }
        if (props.ph !== undefined) {
          displayProps.push({ label: 'pH', value: props.ph });
        }
        if (props.flowRate !== undefined) {
          displayProps.push({ label: 'Flow Rate', value: props.flowRate, unit: 'mL/min' });
        }
        break;
      default:
        // Show first 3 properties
        Object.entries(props)
          .slice(0, 3)
          .forEach(([key, value]) => {
            if (value !== undefined && typeof value !== 'object') {
              displayProps.push({
                label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                value,
              });
            }
          });
    }

    return displayProps;
  };

  const keyProperties = getKeyProperties();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{parameter.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={getCategoryVariant(parameter.category)}>
                {formatCategory(parameter.category)}
              </Badge>
              {parameter.subcategory && (
                <Badge variant="secondary" size="sm">
                  {parameter.subcategory}
                </Badge>
              )}
              {parameter.type && (
                <Badge variant="secondary" size="sm">
                  {parameter.type}
                </Badge>
              )}
              {!parameter.isSystem && (
                <Badge variant="secondary" size="sm">
                  Custom
                </Badge>
              )}
            </div>
          </div>
          {parameter.compatibility && parameter.compatibility.compatibleWith.length > 0 && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">{parameter.compatibility.compatibleWith.length}</span>{' '}
              compatible
            </div>
          )}
        </div>

        {/* Description */}
        {parameter.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{parameter.description}</p>
        )}

        {/* Key Properties */}
        {keyProperties.length > 0 && (
          <div className="space-y-1">
            {keyProperties.map((prop, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{prop.label}:</span>
                <span className="font-medium text-gray-900">
                  {prop.value}
                  {prop.unit && <span className="text-gray-500 ml-1">{prop.unit}</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="primary" size="sm" className="flex-1">
            Use in Prediction
          </Button>
          <Button variant="outline" size="sm" onClick={onSelect}>
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
