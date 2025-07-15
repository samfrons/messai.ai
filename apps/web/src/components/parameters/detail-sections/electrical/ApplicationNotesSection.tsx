'use client';

import React from 'react';
import type { ApplicationNote } from '@/types/parameters';
import { Card, Badge } from '@messai/ui';
import { FileText, Target, Beaker, Building } from '../../../ui/icons';
import { Separator } from '../../../ui/separator';

interface ApplicationNotesSectionProps {
  notes: ApplicationNote[];
}

const scaleIcons = {
  Laboratory: Beaker,
  Pilot: Target,
  Commercial: Building,
};

export function ApplicationNotesSection({ notes }: ApplicationNotesSectionProps) {
  if (!notes || notes.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Application Notes</h3>
        </div>
        <div className="space-y-6">
          {notes.map((note, index) => {
            const Icon = scaleIcons[note.scale as keyof typeof scaleIcons] || FileText;

            return (
              <div key={index} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">{note.scale} Systems</h4>
                </div>

                {note.typicalRange && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Typical Range:</span>
                    <Badge variant="outline" className="font-mono">
                      {note.typicalRange}
                    </Badge>
                  </div>
                )}

                {note.considerations && note.considerations.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">Considerations</h5>
                    <ul className="space-y-1 ml-4">
                      {note.considerations.map((consideration, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                          • {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.targets && note.targets.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">
                      Performance Targets
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {note.targets.map((target, idx) => (
                        <Badge key={idx} variant="secondary">
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
