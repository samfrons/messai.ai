'use client';

import React from 'react';
import type { PreparationMethod } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { FlaskConical, AlertTriangle, Wrench } from '../../ui/icons';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';

interface PreparationMethodsSectionProps {
  methods: PreparationMethod[];
}

export function PreparationMethodsSection({ methods }: PreparationMethodsSectionProps) {
  if (!methods || methods.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FlaskConical className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Preparation Methods</h3>
        </div>
        <div className="space-y-6">
          {methods.map((method, index) => (
            <div key={index} className="space-y-3">
              {index > 0 && <Separator />}
              <div className="flex items-start justify-between">
                <h4 className="font-medium">{method.name}</h4>
                {method.type && (
                  <Badge variant="outline" className="text-xs">
                    {method.type}
                  </Badge>
                )}
              </div>

              {/* Steps */}
              <ol className="list-decimal list-inside space-y-2 ml-4">
                {method.steps.map((step, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>

              {/* Conditions */}
              {method.conditions && (
                <Alert>
                  <AlertDescription className="text-sm">
                    <span className="font-medium">Conditions: </span>
                    {method.conditions}
                  </AlertDescription>
                </Alert>
              )}

              {/* Equipment */}
              {method.equipment && method.equipment.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium text-muted-foreground">Equipment: </span>
                    <span className="text-muted-foreground">{method.equipment.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Safety */}
              {method.safety && method.safety.length > 0 && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    <span className="font-medium text-amber-900">Safety: </span>
                    <ul className="mt-1 space-y-1">
                      {method.safety.map((item, idx) => (
                        <li key={idx} className="text-sm text-amber-800">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
