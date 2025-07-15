'use client';

import type { SpeciesConsideration } from '../../../../types/parameters';
import { Card, Badge } from '@messai/ui';
import { Bug, Dna } from '../../../ui/icons';
import { Separator } from '../../../ui/separator';

interface SpeciesConsiderationsSectionProps {
  species: SpeciesConsideration[];
}

export function SpeciesConsiderationsSection({ species }: SpeciesConsiderationsSectionProps) {
  if (!species || species.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bug className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Species Considerations</h3>
        </div>
        <div className="space-y-6">
          {species.map((sp, index) => (
            <div key={index} className="space-y-3">
              {index > 0 && <Separator />}
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-lg">{sp.species}</h4>
                {sp.efficiency && <Badge variant="default">{sp.efficiency}</Badge>}
              </div>

              {sp.mechanism && (
                <div className="space-y-1">
                  <h5 className="text-sm font-medium text-muted-foreground">Mechanism</h5>
                  <p className="text-sm">{sp.mechanism}</p>
                </div>
              )}

              {sp.characteristics && sp.characteristics.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Characteristics</h5>
                  <div className="grid gap-2">
                    {sp.characteristics.map(
                      (char: { property: string; value: string }, idx: number) => (
                        <div key={idx} className="flex items-center justify-between py-1">
                          <span className="text-sm">{char.property}</span>
                          <Badge variant="outline" className="font-mono text-xs">
                            {char.value}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {sp.proteins && sp.proteins.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Dna className="h-3 w-3" />
                    Key Proteins
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {sp.proteins.map((protein: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="font-mono">
                        {protein}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
