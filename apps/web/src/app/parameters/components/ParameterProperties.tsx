import { Card } from '@messai/ui';
import type { ParameterDetail } from '../../../types/parameters';

interface ParameterPropertiesProps {
  parameter: ParameterDetail;
}

export default function ParameterProperties({ parameter }: ParameterPropertiesProps) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  };

  const renderPropertyRow = (label: string, value: any, unit?: string) => {
    if (value === undefined || value === null) return null;

    return (
      <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {formatValue(value)}
          {unit && ` ${unit}`}
        </span>
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Properties</h2>

        <div className="space-y-1">
          {/* Basic Properties */}
          {renderPropertyRow('Unit', parameter.unit)}
          {renderPropertyRow('Type', parameter.type)}

          {/* Range */}
          {parameter.range && (
            <>
              {renderPropertyRow('Minimum', parameter.range.min, parameter.unit)}
              {renderPropertyRow('Maximum', parameter.range.max, parameter.unit)}
            </>
          )}

          {/* Default Value */}
          {parameter.default !== undefined &&
            renderPropertyRow('Default', parameter.default, parameter.unit)}

          {/* Typical Range */}
          {parameter.typicalRange && (
            <>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Typical Range</div>
                {renderPropertyRow('Typical Min', parameter.typicalRange.min, parameter.unit)}
                {renderPropertyRow('Typical Max', parameter.typicalRange.max, parameter.unit)}
              </div>
            </>
          )}

          {/* Additional Properties */}
          {parameter.properties && Object.keys(parameter.properties).length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Additional Properties</div>
              {Object.entries(parameter.properties).map(([key, value]) =>
                renderPropertyRow(
                  key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                  value
                )
              )}
            </div>
          )}

          {/* Validation Rules */}
          {parameter.validationRules &&
            Array.isArray(parameter.validationRules) &&
            parameter.validationRules.length > 0 && (
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Validation Rules</div>
                <ul className="space-y-1 text-sm text-gray-600">
                  {parameter.validationRules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span>{typeof rule === 'string' ? rule : (rule as any).message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      </div>
    </Card>
  );
}
