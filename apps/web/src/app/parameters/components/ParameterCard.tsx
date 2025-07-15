import Link from 'next/link';
import { Card, Badge, Button } from '@messai/ui';
import type { Parameter, ElectrodeType } from '../../../types/parameters';

interface ParameterCardProps {
  parameter: Parameter;
  onSelect?: () => void;
}

export default function ParameterCard({ parameter }: ParameterCardProps) {
  // Format category for display
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get electrode type from subcategory
  const getElectrodeType = (): ElectrodeType | null => {
    if (parameter.category !== 'electrode' || !parameter.subcategoryCode) return null;
    if (parameter.subcategoryCode.includes('anode')) return 'anode';
    if (parameter.subcategoryCode.includes('cathode')) return 'cathode';
    return null;
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

    // Show parameter range if available
    if (parameter.range && parameter.range.min !== undefined && parameter.range.max !== undefined) {
      displayProps.push({
        label: 'Range',
        value: `${parameter.range.min} - ${parameter.range.max}`,
        ...(parameter.unit && { unit: parameter.unit }),
      });
    } else if (parameter.default !== undefined) {
      displayProps.push({
        label: 'Default',
        value: parameter.default,
        ...(parameter.unit && { unit: parameter.unit }),
      });
    }

    // Show typical range if available
    if (
      parameter.typicalRange &&
      parameter.typicalRange.min !== undefined &&
      parameter.typicalRange.max !== undefined
    ) {
      displayProps.push({
        label: 'Typical Range',
        value: `${parameter.typicalRange.min} - ${parameter.typicalRange.max}`,
        ...(parameter.unit && { unit: parameter.unit }),
      });
    }

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
              {getElectrodeType() && (
                <Badge variant={getElectrodeType() === 'anode' ? 'error' : 'primary'} size="sm">
                  {getElectrodeType()}
                </Badge>
              )}
              {parameter.type && (
                <Badge variant="secondary" size="sm">
                  {parameter.type}
                </Badge>
              )}
              {parameter.unit && (
                <Badge variant="secondary" size="sm">
                  {parameter.unit}
                </Badge>
              )}
              {!parameter.isSystem && (
                <Badge variant="secondary" size="sm">
                  Custom
                </Badge>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500 space-y-1">
            {parameter.compatibility && parameter.compatibility.compatibleWith.length > 0 && (
              <div>
                <span className="font-medium">{parameter.compatibility.compatibleWith.length}</span>{' '}
                compatible
              </div>
            )}
            {parameter.references && parameter.references.length > 0 && (
              <div className="text-xs">
                📚 {parameter.references.length} reference
                {parameter.references.length > 1 ? 's' : ''}
              </div>
            )}
            {parameter.dependencies && parameter.dependencies.length > 0 && (
              <div className="text-xs">
                🔗 {parameter.dependencies.length} dependenc
                {parameter.dependencies.length > 1 ? 'ies' : 'y'}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {parameter.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{parameter.description}</p>
        )}

        {/* Validation Rules */}
        {parameter.validationRules && parameter.validationRules.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <div className="text-xs font-medium text-blue-800 mb-1">Validation Rules:</div>
            <div className="text-xs text-blue-600">
              {parameter.validationRules.slice(0, 2).map((rule, index) => (
                <div key={index}>• {rule}</div>
              ))}
              {parameter.validationRules.length > 2 && (
                <div className="text-blue-500">+{parameter.validationRules.length - 2} more...</div>
              )}
            </div>
          </div>
        )}

        {/* Compatibility Information */}
        {parameter.compatibility && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="text-xs font-medium text-green-800 mb-1">Compatibility:</div>
            <div className="text-xs text-green-600 space-y-1">
              {parameter.compatibility.materials &&
                parameter.compatibility.materials.length > 0 && (
                  <div>
                    Materials: {parameter.compatibility.materials.slice(0, 2).join(', ')}
                    {parameter.compatibility.materials.length > 2 &&
                      ` +${parameter.compatibility.materials.length - 2} more`}
                  </div>
                )}
              {parameter.compatibility.microbes && parameter.compatibility.microbes.length > 0 && (
                <div>
                  Microbes: {parameter.compatibility.microbes.slice(0, 2).join(', ')}
                  {parameter.compatibility.microbes.length > 2 &&
                    ` +${parameter.compatibility.microbes.length - 2} more`}
                </div>
              )}
              {parameter.compatibility.systemTypes &&
                parameter.compatibility.systemTypes.length > 0 && (
                  <div>
                    Systems: {parameter.compatibility.systemTypes.slice(0, 2).join(', ')}
                    {parameter.compatibility.systemTypes.length > 2 &&
                      ` +${parameter.compatibility.systemTypes.length - 2} more`}
                  </div>
                )}
            </div>
          </div>
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
            Use in Model
          </Button>
          <Link href={`/parameters/${parameter.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          {parameter.outlierThreshold && (
            <Button
              variant="ghost"
              size="sm"
              title={`Outlier threshold: ${parameter.outlierThreshold}`}
            >
              ⚠️
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
