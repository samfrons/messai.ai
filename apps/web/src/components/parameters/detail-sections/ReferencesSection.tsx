'use client';

import React from 'react';
import type { Reference } from '@/types/parameters';
import { Card, Badge, Button } from '@messai/ui';
import { BookOpen, ExternalLink, Calendar } from '../../ui/icons';
import { Separator } from '../../ui/separator';

interface ReferencesSectionProps {
  references: Reference[];
}

export function ReferencesSection({ references }: ReferencesSectionProps) {
  if (!references || references.length === 0) {
    return null;
  }

  const groupedRefs = references.reduce((acc, ref) => {
    const category = ref.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ref);
    return acc;
  }, {} as Record<string, Reference[]>);

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5" />
          <h3 className="text-lg font-semibold">References</h3>
        </div>
        <div className="space-y-6">
          {Object.entries(groupedRefs).map(([category, refs], groupIndex) => (
            <div key={category} className="space-y-3">
              {groupIndex > 0 && <Separator />}
              <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
              <div className="space-y-3">
                {refs.map((ref, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-relaxed">{ref.text}</p>
                        {ref.authors && ref.authors.length > 0 && (
                          <p className="text-xs text-muted-foreground">{ref.authors.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {ref.year && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {ref.year}
                          </Badge>
                        )}
                        {(ref.doi || ref.url) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              window.open(
                                ref.doi ? `https://doi.org/${ref.doi}` : ref.url,
                                '_blank'
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {ref.doi && (
                      <p className="text-xs text-muted-foreground font-mono">DOI: {ref.doi}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
