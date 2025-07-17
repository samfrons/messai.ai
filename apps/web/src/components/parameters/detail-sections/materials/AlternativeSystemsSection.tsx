'use client';

// React import removed - not needed for JSX in React 18+
import type { AlternativeSystem } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Layers3, CheckCircle, XCircle } from '../../../ui/icons';
import { Separator } from '../../../ui/separator';

interface AlternativeSystemsSectionProps {
  systems: AlternativeSystem[];
}

export function AlternativeSystemsSection({ systems }: AlternativeSystemsSectionProps) {
  if (!systems || systems.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Layers3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Alternative Systems</h3>
        </div>
        <div className="space-y-6">
          {systems.map((system, index) => (
            <div key={index} className="space-y-3">
              {index > 0 && <Separator />}
              <div className="flex items-start justify-between">
                <h4 className="font-medium">{system.name}</h4>
                {system.type && (
                  <Badge variant="outline" className="text-xs">
                    {system.type}
                  </Badge>
                )}
              </div>

              {system.materials && system.materials.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Materials</h5>
                  <div className="flex flex-wrap gap-2">
                    {system.materials.map((material, idx) => (
                      <Badge key={idx} variant="secondary">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {system.advantages && system.advantages.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Advantages
                    </h5>
                    <ul className="space-y-1 ml-4">
                      {system.advantages.map((adv, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {system.limitations && system.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      Limitations
                    </h5>
                    <ul className="space-y-1 ml-4">
                      {system.limitations.map((lim, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {lim}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
