'use client';

// React import removed - not needed in React 18+
import type { Formula } from '@/types/parameters';
import { Card } from '@messai/ui';
import { Calculator, Info } from '../../../ui/icons';
import { Alert, AlertDescription } from '../../../ui/alert';

interface FormulaSectionProps {
  formula: Formula;
}

export function FormulaSection({ formula }: FormulaSectionProps) {
  if (!formula || !formula.equation) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Formula</h3>
        </div>
        <div className="space-y-4">
          {/* Main Equation */}
          <div className="bg-muted/50 p-6 rounded-lg">
            <p className="font-mono text-xl text-center">{formula.equation}</p>
          </div>

          {/* Variables */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Where:</h4>
            <div className="space-y-2">
              {formula.variables.map((variable, index) => (
                <div key={index} className="flex items-start gap-3 ml-4">
                  <span className="font-mono font-bold text-primary min-w-[3rem]">
                    {variable.symbol}
                  </span>
                  <span className="text-sm">
                    = {variable.description}
                    <span className="text-muted-foreground ml-2">({variable.unit})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Derivation */}
          {formula.derivation && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="mt-2">
                <h4 className="font-medium mb-2">Derivation</h4>
                <p className="text-sm">{formula.derivation}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Card>
  );
}
