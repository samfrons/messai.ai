'use client';

import type { CompositionStructure } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Atom, Layers } from '../../../ui/icons';
import { Separator } from '../../../ui/separator';

interface CompositionStructureSectionProps {
  composition: CompositionStructure;
}

export function CompositionStructureSection({ composition }: CompositionStructureSectionProps) {
  if (!composition) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Atom className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Composition & Structure</h3>
        </div>
        <div className="space-y-4">
          {composition.chemicalFormula && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Chemical Formula</h4>
              <div className="bg-muted/50 p-3 rounded-lg font-mono text-lg text-center">
                {composition.chemicalFormula}
              </div>
            </div>
          )}

          {composition.structure && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-sm">Structure</h4>
              </div>
              <p className="text-sm text-muted-foreground">{composition.structure}</p>
            </div>
          )}

          {composition.physicalProperties && composition.physicalProperties.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Physical Properties</h4>
                <div className="grid gap-2">
                  {composition.physicalProperties.map((prop, index) => (
                    <div key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm font-medium">{prop.property}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{prop.value}</span>
                        {prop.unit && (
                          <Badge variant="outline" className="text-xs">
                            {prop.unit}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {composition.morphology && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Morphology</h4>
                <p className="text-sm text-muted-foreground">{composition.morphology}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
