'use client';

import type { TypicalValues } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { TrendingUp, AlertTriangle } from '../../ui/icons';

interface TypicalValuesSectionProps {
  typicalValues: TypicalValues;
  unit?: string;
}

export function TypicalValuesSection({ typicalValues, unit }: TypicalValuesSectionProps) {
  if (!typicalValues) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Typical Values</h3>
        </div>
        <div className="space-y-4">
          {typicalValues.range && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Range</span>
                <span className="font-mono">
                  {typicalValues.range.min} - {typicalValues.range.max}
                  {unit && ` ${unit}`}
                </span>
              </div>

              {typicalValues.typical && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Typical</span>
                  <span className="font-mono">
                    {typicalValues.typical}
                    {unit && ` ${unit}`}
                  </span>
                </div>
              )}

              {typicalValues.outlierThreshold && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    Outlier Threshold
                  </span>
                  <span className="font-mono text-amber-600">
                    &gt;{typicalValues.outlierThreshold}
                    {unit && ` ${unit}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {typicalValues.categories && typicalValues.categories.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Performance Categories</h4>
              <div className="space-y-2">
                {typicalValues.categories.map((category, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Badge variant="outline" className="min-w-fit">
                      {category.name}
                    </Badge>
                    <div className="flex-1 text-sm">
                      <span className="font-mono">{category.range}</span>
                      {category.description && (
                        <p className="text-muted-foreground mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {typicalValues.distribution && typicalValues.distribution.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Distribution</h4>
              <div className="space-y-2">
                {typicalValues.distribution.map((dist, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{dist.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{dist.percentage}</span>
                      {dist.description && (
                        <span className="text-xs text-muted-foreground">({dist.description})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
