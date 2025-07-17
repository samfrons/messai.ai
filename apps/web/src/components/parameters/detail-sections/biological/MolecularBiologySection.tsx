'use client';

// React import removed - not needed for JSX in React 18+
import type { MolecularBiology } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { Dna, GitMerge, Activity } from '../../../ui/icons';
import { Separator } from '../../../ui/separator';

interface MolecularBiologySectionProps {
  biology: MolecularBiology;
}

export function MolecularBiologySection({ biology }: MolecularBiologySectionProps) {
  if (!biology) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Dna className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Molecular Biology</h3>
        </div>
        <div className="space-y-6">
          {/* Gene Expression */}
          {biology.geneExpression && biology.geneExpression.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Gene Expression</h4>
              </div>
              <div className="space-y-2">
                {biology.geneExpression.map((gene: string, index: number) => (
                  <Badge key={index} variant="outline" className="mr-2">
                    {gene}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Proteins */}
          {biology.proteins && biology.proteins.length > 0 && (
            <>
              {biology.geneExpression && biology.geneExpression.length > 0 && <Separator />}
              <div className="space-y-3">
                <h4 className="font-medium">Key Proteins</h4>
                <div className="space-y-3">
                  {biology.proteins.map(
                    (protein: { name: string; function: string }, index: number) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {protein.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground ml-4">{protein.function}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {/* Pathways */}
          {biology.pathways && biology.pathways.length > 0 && (
            <>
              {((biology.geneExpression?.length || 0) > 0 ||
                (biology.proteins?.length || 0) > 0) && <Separator />}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitMerge className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Metabolic Pathways</h4>
                </div>
                <ul className="space-y-2 ml-4">
                  {biology.pathways.map((pathway: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {pathway}
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
