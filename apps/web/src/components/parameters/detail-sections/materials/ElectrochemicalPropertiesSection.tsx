'use client';

import type { ElectrochemicalProperties } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Zap, Battery } from '../../../ui/icons';
import { Separator } from '../../../ui/separator';
import { Alert, AlertDescription } from '../../../ui/alert';

interface ElectrochemicalPropertiesSectionProps {
  properties: ElectrochemicalProperties;
}

export function ElectrochemicalPropertiesSection({
  properties,
}: ElectrochemicalPropertiesSectionProps) {
  if (!properties) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Battery className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Electrochemical Properties</h3>
        </div>
        <div className="space-y-6">
          {/* Standard Properties */}
          {properties.properties && properties.properties.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium">Performance Properties</h4>
              </div>
              <div className="space-y-3">
                {properties.properties.map((prop, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{prop.name}</span>
                      <Badge variant="default" className="font-mono">
                        {prop.value}
                      </Badge>
                    </div>
                    {prop.conditions && (
                      <p className="text-xs text-muted-foreground ml-4">
                        Conditions: {prop.conditions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Properties */}
          {properties.advancedProperties && properties.advancedProperties.length > 0 && (
            <>
              {properties.properties && properties.properties.length > 0 && <Separator />}
              <div className="space-y-3">
                <h4 className="font-medium">Advanced Properties</h4>
                <div className="space-y-3">
                  {properties.advancedProperties.map((prop, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{prop.name}</span>
                        <Badge variant="secondary" className="font-mono">
                          {prop.value}
                        </Badge>
                      </div>
                      {prop.significance && (
                        <Alert>
                          <AlertDescription className="text-sm">
                            {prop.significance}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
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
