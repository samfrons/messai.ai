'use client';

import React from 'react';
import type { ValidationRules } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { CheckCircle, Beaker, FileText } from '../../ui/icons';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription } from '../../ui/alert';

interface ValidationRulesSectionProps {
  rules: ValidationRules;
}

export function ValidationRulesSection({ rules }: ValidationRulesSectionProps) {
  if (!rules) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Validation Rules</h3>
        </div>
        <div className="space-y-6">
          {/* Parameter Rules */}
          {rules.parameters && rules.parameters.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Parameter Validation</h4>
              <div className="space-y-2">
                {rules.parameters.map((param, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <h5 className="font-medium text-sm">{param.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {param.rule}
                      </Badge>
                    </div>
                    {param.reason && (
                      <p className="text-xs text-muted-foreground ml-4">{param.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quality Control */}
          {rules.qualityControl && rules.qualityControl.length > 0 && (
            <>
              {rules.parameters && rules.parameters.length > 0 && <Separator />}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Beaker className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium">Quality Control</h4>
                </div>
                <div className="space-y-3">
                  {rules.qualityControl.map((qc, index) => (
                    <div key={index} className="space-y-1">
                      <h5 className="font-medium text-sm">{qc.test}</h5>
                      <p className="text-sm text-muted-foreground ml-4">Method: {qc.method}</p>
                      {qc.criteria && (
                        <Alert className="ml-4">
                          <AlertDescription className="text-xs">
                            Criteria: {qc.criteria}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Standards */}
          {rules.standards && rules.standards.length > 0 && (
            <>
              {((rules.parameters?.length || 0) > 0 || (rules.qualityControl?.length || 0) > 0) && (
                <Separator />
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Applicable Standards</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rules.standards.map((standard, index) => (
                    <Badge key={index} variant="secondary">
                      {standard}
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
