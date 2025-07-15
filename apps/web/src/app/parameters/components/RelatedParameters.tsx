import Link from 'next/link';
import { Card } from '@messai/ui';
import type { RelatedParameter } from '../../../types/parameters';

interface RelatedParametersProps {
  parameters: RelatedParameter[];
}

export default function RelatedParameters({ parameters }: RelatedParametersProps) {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Parameters</h3>

        <div className="space-y-2">
          {parameters.map((param) => (
            <Link
              key={param.id}
              href={`/parameters/${param.id}`}
              className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{param.name}</div>
              {param.category && <div className="text-xs text-gray-500 mt-1">{param.category}</div>}
            </Link>
          ))}
        </div>

        {parameters.length === 0 && (
          <p className="text-sm text-gray-500">No related parameters found.</p>
        )}
      </div>
    </Card>
  );
}
