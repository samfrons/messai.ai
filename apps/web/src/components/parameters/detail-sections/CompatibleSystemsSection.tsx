'use client';

import type { CompatibleSystems } from '../../../types/parameters';
import { Card, Badge } from '@messai/ui';
import { Network, Thermometer, Globe } from '../../ui/icons';
import { Separator } from '../../ui/separator';

interface CompatibleSystemsSectionProps {
  systems: CompatibleSystems;
}

export function CompatibleSystemsSection({ systems }: CompatibleSystemsSectionProps) {
  if (!systems) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Network className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Compatible Systems</h3>
        </div>
        <div className="space-y-6">
          {/* Operating Conditions */}
          {systems.operatingConditions && systems.operatingConditions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <h4 className="font-medium">Operating Conditions</h4>
              </div>
              <div className="grid gap-2">
                {systems.operatingConditions.map((condition: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">{condition.parameter}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{condition.range}</span>
                      {condition.optimal && (
                        <Badge variant="secondary" className="text-xs">
                          Optimal: {condition.optimal}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applications */}
          {systems.applications && systems.applications.length > 0 && (
            <>
              {systems.operatingConditions && systems.operatingConditions.length > 0 && (
                <Separator />
              )}
              <div className="space-y-3">
                <h4 className="font-medium">System Applications</h4>
                <div className="space-y-3">
                  {systems.applications.map((app: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{app.name}</h5>
                        {app.suitability && (
                          <Badge variant="outline" className="text-xs">
                            {app.suitability}
                          </Badge>
                        )}
                      </div>
                      {app.description && (
                        <p className="text-sm text-muted-foreground ml-4">{app.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Environments */}
          {systems.environments && systems.environments.length > 0 && (
            <>
              {((systems.operatingConditions?.length || 0) > 0 ||
                (systems.applications?.length || 0) > 0) && <Separator />}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Environmental Compatibility</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {systems.environments.map((env: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {env}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
