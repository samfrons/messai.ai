import { Card, Badge } from '@messai/ui';

interface CompatibilityMatrixProps {
  compatibility: any;
}

export default function CompatibilityMatrix({ compatibility }: CompatibilityMatrixProps) {
  const renderCompatibilityList = (items: string[], title: string, color: string) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <Badge key={index} variant="outline" className={`text-xs ${color}`}>
              {item}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compatibility</h3>

        {/* Compatible Materials */}
        {renderCompatibilityList(
          compatibility.materials,
          'Compatible Materials',
          'border-green-200 text-green-700'
        )}

        {/* Compatible Microbes */}
        {renderCompatibilityList(
          compatibility.microbes,
          'Compatible Microbes',
          'border-blue-200 text-blue-700'
        )}

        {/* Compatible Environments */}
        {renderCompatibilityList(
          compatibility.environments,
          'Compatible Environments',
          'border-purple-200 text-purple-700'
        )}

        {/* Compatible System Types */}
        {renderCompatibilityList(
          compatibility.systemTypes,
          'Compatible Systems',
          'border-orange-200 text-orange-700'
        )}

        {/* Compatibility Notes */}
        {compatibility.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">{compatibility.notes}</p>
          </div>
        )}

        {/* No compatibility data */}
        {!compatibility.materials?.length &&
          !compatibility.microbes?.length &&
          !compatibility.environments?.length &&
          !compatibility.systemTypes?.length && (
            <p className="text-sm text-gray-500">
              No specific compatibility information available for this parameter.
            </p>
          )}
      </div>
    </Card>
  );
}
