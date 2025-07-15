'use client';

import React, { useState, useRef } from 'react';
import { Button, Badge, Card } from '@messai/ui';

interface Enhanced3DControlsProps {
  onViewChange?: (view: string) => void;
  onScreenshot?: () => void;
  onFullscreen?: () => void;
  onReset?: () => void;
}

export default function Enhanced3DControls({
  onViewChange,
  onScreenshot,
  onFullscreen,
  onReset,
}: Enhanced3DControlsProps) {
  const [activeView, setActiveView] = useState('perspective');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presetViews = [
    { id: 'perspective', label: 'Perspective', icon: '📐' },
    { id: 'top', label: 'Top View', icon: '⬆️' },
    { id: 'front', label: 'Front View', icon: '👀' },
    { id: 'side', label: 'Side View', icon: '↔️' },
    { id: 'isometric', label: 'Isometric', icon: '🔧' },
  ];

  const handleViewChange = (viewId: string) => {
    setActiveView(viewId);
    setIsAnimating(true);
    onViewChange?.(viewId);

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleScreenshot = () => {
    onScreenshot?.();
    // Could show a toast notification here
  };

  const renderControls = () => (
    <div className="space-y-4">
      {/* Preset Views */}
      <div>
        <h4 className="text-sm font-medium mb-2">Camera Views</h4>
        <div className="grid grid-cols-2 gap-2">
          {presetViews.map((view) => (
            <Button
              key={view.id}
              variant={activeView === view.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleViewChange(view.id)}
              disabled={isAnimating}
              className="text-xs"
            >
              <span className="mr-1">{view.icon}</span>
              {view.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Animation Controls */}
      <div>
        <h4 className="text-sm font-medium mb-2">Animation</h4>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => setIsAnimating(!isAnimating)}
            className="text-xs"
          >
            <span className="mr-2">🔄</span>
            {isAnimating ? 'Stop Rotation' : 'Auto Rotate'}
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={onReset} className="text-xs">
            <span className="mr-2">🏠</span>
            Reset View
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvanced && (
        <div>
          <h4 className="text-sm font-medium mb-2">Advanced</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScreenshot}
                className="text-xs flex-1"
              >
                <span className="mr-2">📸</span>
                Screenshot
              </Button>
              <Button variant="outline" size="sm" onClick={onFullscreen} className="text-xs flex-1">
                <span className="mr-2">⛶</span>
                Fullscreen
              </Button>
            </div>
            <Button variant="outline" size="sm" fullWidth className="text-xs">
              <span className="mr-2">📊</span>
              Performance
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute top-4 left-4 z-10">
      <Card className="w-48 shadow-lg">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">3D Controls</h3>
            <div className="flex items-center gap-1">
              {isAnimating && (
                <Badge variant="outline" size="xs" className="bg-blue-50 text-blue-600">
                  Animating
                </Badge>
              )}
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-6 w-6 p-0"
              >
                {showAdvanced ? '−' : '+'}
              </Button>
            </div>
          </div>

          {renderControls()}
        </div>
      </Card>
    </div>
  );
}
