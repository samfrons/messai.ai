import React, { memo } from 'react';
import { Card } from '@messai/ui';
import ParameterCard from './ParameterCard';
import type { Parameter } from '../../../types/parameters';

interface ParameterListProps {
  parameters: Parameter[];
  isLoading: boolean;
  onParameterSelect: (parameter: Parameter) => void;
}

const ParameterList = memo(function ParameterList({
  parameters,
  isLoading,
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
