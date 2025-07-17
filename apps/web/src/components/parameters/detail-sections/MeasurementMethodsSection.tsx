'use client';

import type { MeasurementMethod } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Microscope, Wrench } from '../../ui/icons';
import { Separator } from '../../ui/separator';

interface MeasurementMethodsSectionProps {
  methods: MeasurementMethod[];
}

export function MeasurementMethodsSection({ methods }: MeasurementMethodsSectionProps) {
  if (!methods || methods.length === 0) {
    return null;
  }

  const groupedMethods = methods.reduce((acc, method) => {
    const type = method.type || 'General';
    if (!acc[type]) acc[type] = [];
    acc[type].push(method);
    return acc;
  }, {} as Record<string, MeasurementMethod[]>);

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Microscope className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Measurement Methods</h3>
        </div>
        <div className="space-y-6">
          {Object.entries(groupedMethods).map(([type, typeMethods], groupIndex) => (
            <div key={type} className="space-y-4">
              {groupIndex > 0 && <Separator />}
              <h4 className="font-medium text-sm text-muted-foreground">{type}</h4>
              <div className="space-y-4">
                {typeMethods.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h5 className="font-medium">{method.name}</h5>
                      {method.accuracy && (
                        <Badge variant="secondary" className="text-xs">
                          {method.accuracy}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>

                    {(method.equipment || method.conditions) && (
                      <div className="grid gap-2 ml-4">
                        {method.equipment && method.equipment.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Wrench className="h-3 w-3 mt-0.5 text-muted-foreground" />
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Equipment: </span>
                              {method.equipment.join(', ')}
                            </div>
                          </div>
                        )}
                        {method.conditions && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Conditions: </span>
                            {method.conditions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
