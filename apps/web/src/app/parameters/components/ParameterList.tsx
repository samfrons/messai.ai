import { memo } from 'react';
import { Card } from '@messai/ui';
import ParameterCard from './ParameterCard';
import type { Parameter } from '../../../types/parameters';

interface ParameterListProps {
  parameters: Parameter[];
  isLoading: boolean;
  error?: string | null;
  onParameterSelect: (parameter: Parameter) => void;
}

const ParameterList = memo(function ParameterList({
  parameters,
  isLoading,
  error,
  onParameterSelect,
}: ParameterListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Card className="text-center py-12 border-red-200 bg-red-50">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Parameters</h3>
        <p className="text-red-600 max-w-md mx-auto mb-4">{error}</p>
        <p className="text-sm text-red-500">
          Check the browser console for more details or refresh the page to try again.
        </p>
      </Card>
    );
  }

  if (parameters.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No parameters found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Try adjusting your search criteria or filters to find the parameters you're looking for.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parameters.map((parameter) => (
        <ParameterCard
          key={parameter.id}
          parameter={parameter}
          onSelect={() => onParameterSelect(parameter)}
        />
      ))}
    </div>
  );
});

export default ParameterList;
