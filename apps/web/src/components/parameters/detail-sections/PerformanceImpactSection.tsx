'use client';

import React from 'react';
import type { PerformanceImpact } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Activity, TrendingUp, Clock } from '../../ui/icons';
import { Separator } from '../../ui/separator';

interface PerformanceImpactSectionProps {
  impact: PerformanceImpact;
}

export function PerformanceImpactSection({ impact }: PerformanceImpactSectionProps) {
  if (!impact) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Performance Impact</h3>
        </div>
        <div className="space-y-6">
          {/* Metrics Impact */}
          {impact.metrics && impact.metrics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Performance Metrics</h4>
              </div>
              <div className="space-y-3">
                {impact.metrics.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-sm">{metric.name}</h5>
                      {metric.correlation && (
                        <Badge variant="outline" className="text-xs">
                          {metric.correlation}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground ml-4">{metric.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Efficiency */}
          {impact.efficiency && impact.efficiency.length > 0 && (
            <>
              {impact.metrics && impact.metrics.length > 0 && <Separator />}
              <div className="space-y-3">
                <h4 className="font-medium">System Efficiency</h4>
                <div className="space-y-3">
                  {impact.efficiency.map((eff, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{eff.type}</h5>
                        <span className="font-mono text-sm">{eff.range}</span>
                      </div>
                      {eff.conditions && (
                        <p className="text-xs text-muted-foreground ml-4">
                          Conditions: {eff.conditions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Stability */}
          {impact.stability && (
            <>
              {(impact.metrics?.length || impact.efficiency?.length) && <Separator />}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Stability & Longevity</h4>
                </div>
                <p className="text-sm text-muted-foreground">{impact.stability}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
