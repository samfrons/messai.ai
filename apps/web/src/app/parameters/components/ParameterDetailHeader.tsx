import { Badge } from '@messai/ui';
import type { ParameterDetail } from '../../../types/parameters';
import { PARAMETER_CATEGORIES } from '../utils/parameter-categories';

interface ParameterDetailHeaderProps {
  parameter: ParameterDetail;
}

export default function ParameterDetailHeader({ parameter }: ParameterDetailHeaderProps) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{parameter.name}</h1>
          <p className="text-lg text-gray-600 mt-2">{parameter.description}</p>

          {/* Category Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {parameter.displayCategory && (
              <Badge variant="primary">{PARAMETER_CATEGORIES[parameter.displayCategory]}</Badge>
            )}
            <Badge variant="secondary">{parameter.categoryName || parameter.category}</Badge>
            {parameter.subcategory && <Badge variant="outline">{parameter.subcategory}</Badge>}
            {parameter.electrodeType && (
              <Badge
                variant="default"
                className={
                  parameter.electrodeType === 'anode'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : parameter.electrodeType === 'cathode'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : ''
                }
              >
                {parameter.electrodeType}
              </Badge>
            )}
            {parameter.isSystem && <Badge variant="primary">System Parameter</Badge>}
          </div>
        </div>

        {/* Parameter ID and Source */}
        <div className="text-right text-sm text-gray-500">
          <div>ID: {parameter.id}</div>
          {parameter.source && <div>Source: {parameter.source}</div>}
        </div>
      </div>
    </div>
  );
}
