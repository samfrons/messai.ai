'use client';

import React from 'react';
import type { Definition } from '@/types/parameters';
import { Card } from '@messai/ui';
import { BookOpen } from '../../ui/icons';

interface DefinitionSectionProps {
  definition: Definition;
}

export function DefinitionSection({ definition }: DefinitionSectionProps) {
  if (!definition?.text) return null;

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Definition</h3>
      </div>
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">{definition.text}</p>

        {definition.formula && (
          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg font-mono text-center text-lg">
              {definition.formula}
            </div>

            {definition.variables && definition.variables.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-sm">Where:</p>
                <ul className="space-y-1 ml-4">
                  {definition.variables.map((variable, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-mono font-medium">{variable.symbol}</span>
                      {' = '}
                      <span className="text-muted-foreground">{variable.description}</span>
                      {variable.unit && (
                        <span className="text-muted-foreground"> ({variable.unit})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
