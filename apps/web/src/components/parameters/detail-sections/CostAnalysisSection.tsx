'use client';

import type { CostAnalysis } from '../../../types/parameters';
import { Card, Badge } from '@messai/ui';
import { DollarSign, TrendingDown, TrendingUp } from '../../ui/icons';
import { Separator } from '../../ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';

interface CostAnalysisSectionProps {
  analysis: CostAnalysis;
}

export function CostAnalysisSection({ analysis }: CostAnalysisSectionProps) {
  if (!analysis) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Cost Analysis</h3>
        </div>
        <div className="space-y-6">
          {/* Summary */}
          {analysis.summary && (
            <Alert>
              <AlertTitle>Summary</AlertTitle>
              <AlertDescription>{analysis.summary}</AlertDescription>
            </Alert>
          )}

          {/* Cost Breakdown */}
          {analysis.breakdown && analysis.breakdown.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Cost Breakdown</h4>
              <div className="space-y-2">
                {analysis.breakdown.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.item}</span>
                      {item.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {item.cost}
                      </Badge>
                      {item.unit && (
                        <span className="text-xs text-muted-foreground">per {item.unit}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Factors */}
          {analysis.factors && analysis.factors.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Key Cost Factors</h4>
                <ul className="space-y-1 ml-4">
                  {analysis.factors.map((factor: any, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Economic Advantages */}
          {analysis.economicAdvantages && analysis.economicAdvantages.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Economic Advantages</h4>
                </div>
                <ul className="space-y-1 ml-4">
                  {analysis.economicAdvantages.map((advantage: any, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {advantage}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Future Projections */}
          {analysis.futureProjections && analysis.futureProjections.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Future Cost Projections</h4>
                </div>
                <ul className="space-y-1 ml-4">
                  {analysis.futureProjections.map((projection: any, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {projection}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
