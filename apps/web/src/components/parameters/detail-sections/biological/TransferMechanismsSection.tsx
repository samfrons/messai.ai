'use client';

// React import removed - not needed for JSX in React 18+
import type { TransferMechanism } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { GitBranch, Zap } from '../../../ui/icons';
import { Progress } from '../../../ui/progress';

interface TransferMechanismsSectionProps {
  mechanisms: TransferMechanism[];
}

export function TransferMechanismsSection({ mechanisms }: TransferMechanismsSectionProps) {
  if (!mechanisms || mechanisms.length === 0) {
    return null;
  }

  const getEfficiencyValue = (efficiency?: string): number => {
    if (!efficiency) return 0;
    const match = efficiency.match(/(\d+)[-–]?(\d+)?%?/);
    if (match && match[1]) {
      if (match[2]) {
        return (parseInt(match[1]) + parseInt(match[2])) / 2;
      }
      return parseInt(match[1]);
    }
    return 0;
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Transfer Mechanisms</h3>
        </div>
        <div className="space-y-4">
          {mechanisms.map((mechanism, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  {mechanism.type}
                </h4>
                {mechanism.efficiency && (
                  <Badge variant="outline" className="text-xs">
                    {mechanism.efficiency}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{mechanism.description}</p>

              {mechanism.efficiency && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Efficiency</span>
                    <span>{mechanism.efficiency}</span>
                  </div>
                  <Progress value={getEfficiencyValue(mechanism.efficiency)} className="h-2" />
                </div>
              )}

              {mechanism.species && mechanism.species.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-muted-foreground">Common in species:</h5>
                  <div className="flex flex-wrap gap-1">
                    {mechanism.species.map((sp, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {sp}
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
