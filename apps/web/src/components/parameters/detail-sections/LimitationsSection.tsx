'use client';

import type { Limitations } from '@/types/parameters';
import { Card } from '@messai/ui';
import { AlertTriangle, Shield, Activity, Leaf } from '../../ui/icons';
import { Alert, AlertDescription } from '../../ui/alert';

interface LimitationsSectionProps {
  limitations: Limitations;
}

const limitationIcons = {
  performance: Activity,
  practical: AlertTriangle,
  safety: Shield,
  environmental: Leaf,
};

const limitationColors = {
  performance: 'text-blue-500',
  practical: 'text-orange-500',
  safety: 'text-red-500',
  environmental: 'text-green-500',
};

export function LimitationsSection({ limitations }: LimitationsSectionProps) {
  if (!limitations) {
    return null;
  }

  const categories = Object.entries(limitations).filter(([_, items]) => items && items.length > 0);

  if (categories.length === 0) return null;

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Limitations</h3>
        </div>
        <div className="space-y-4">
          {categories.map(([category, items]) => {
            const Icon = limitationIcons[category as keyof typeof limitationIcons] || AlertTriangle;
            const colorClass =
              limitationColors[category as keyof typeof limitationColors] || 'text-gray-500';

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                  <h4 className="font-medium capitalize">{category} Limitations</h4>
                </div>
                <div className="space-y-2 ml-6">
                  {items!.map((item: string, index: number) => (
                    <Alert key={index} className="py-2">
                      <AlertDescription className="text-sm">{item}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
