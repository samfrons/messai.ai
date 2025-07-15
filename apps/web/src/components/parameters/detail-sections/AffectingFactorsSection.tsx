'use client';

import React from 'react';
import type { AffectingFactors } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Zap, Settings } from '../../ui/icons';
import { Separator } from '../../ui/separator';

interface AffectingFactorsSectionProps {
  factors: AffectingFactors;
}

export function AffectingFactorsSection({ factors }: AffectingFactorsSectionProps) {
  if (!factors || !factors.primary?.length) return null;

  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Affecting Factors</h3>
      </div>
      <div className="space-y-6">
        {/* Primary Factors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium">Primary Factors</h4>
          </div>
          <div className="space-y-3">
            {factors.primary.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h5 className="font-medium text-sm">{factor.name}</h5>
                  {factor.impact && (
                    <Badge variant="outline" className="text-xs">
                      {factor.impact}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground ml-4">{factor.description}</p>
                {factor.optimalRange && (
                  <p className="text-xs text-muted-foreground ml-4">
                    <span className="font-medium">Optimal: </span>
                    <span className="font-mono">{factor.optimalRange}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Secondary Factors */}
        {factors.secondary && factors.secondary.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-muted-foreground">Secondary Factors</h4>
              <div className="space-y-3">
                {factors.secondary.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h5 className="font-medium text-sm">{factor.name}</h5>
                      {factor.impact && (
                        <Badge variant="secondary" className="text-xs">
                          {factor.impact}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">{factor.description}</p>
                    {factor.optimalRange && (
                      <p className="text-xs text-muted-foreground ml-4">
                        <span className="font-medium">Optimal: </span>
                        <span className="font-mono">{factor.optimalRange}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
