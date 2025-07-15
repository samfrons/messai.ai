'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge, Card } from '@messai/ui';

interface KeyboardShortcutsProps {
  onShortcut?: (action: string) => void;
}

export default function KeyboardShortcuts({ onShortcut }: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const shortcuts = [
    { keys: ['Space'], action: 'toggle-animation', description: 'Toggle animation' },
    { keys: ['R'], action: 'reset-view', description: 'Reset camera view' },
    { keys: ['F'], action: 'fullscreen', description: 'Toggle fullscreen' },
    { keys: ['S'], action: 'screenshot', description: 'Take screenshot' },
    { keys: ['1'], action: 'view-front', description: 'Front view' },
    { keys: ['2'], action: 'view-side', description: 'Side view' },
    { keys: ['3'], action: 'view-top', description: 'Top view' },
    { keys: ['7'], action: 'view-perspective', description: 'Perspective view' },
    { keys: ['Ctrl', 'Z'], action: 'undo', description: 'Undo last action' },
    { keys: ['Ctrl', 'Y'], action: 'redo', description: 'Redo last action' },
    { keys: ['?'], action: 'toggle-help', description: 'Toggle this help' },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      setPressedKeys((prev) => new Set([...prev, key]));

      // Check for shortcuts
      shortcuts.forEach((shortcut) => {
        const isMatch = shortcut.keys.every((k) => {
          if (k === 'Ctrl') return event.ctrlKey;
          if (k === 'Alt') return event.altKey;
          if (k === 'Shift') return event.shiftKey;
          return k === key;
        });

        if (isMatch) {
          event.preventDefault();
          onShortcut?.(shortcut.action);

          // Special handling for help toggle
          if (shortcut.action === 'toggle-help') {
            setIsVisible(!isVisible);
          }
        }
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(event.key);
        return newSet;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onShortcut, isVisible]);

  const formatKeys = (keys: string[]) => {
    return keys.map((key, index) => (
      <span key={index}>
        <Badge
          variant="outline"
          size="xs"
          className={`mx-1 ${pressedKeys.has(key) ? 'bg-blue-100 border-blue-300' : ''}`}
        >
          {key === 'Space' ? '⎵' : key}
        </Badge>
        {index < keys.length - 1 && <span className="text-gray-400">+</span>}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white shadow-lg"
        >
          <span className="mr-2">⌨️</span>
          Shortcuts
          <Badge variant="outline" size="xs" className="ml-2">
            ?
          </Badge>
        </Button>
      </div>

      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">{formatKeys(shortcut.keys)}</div>
                  <span className="text-gray-600 text-xs ml-4">{shortcut.description}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Press{' '}
                <Badge variant="outline" size="xs">
                  ?
                </Badge>{' '}
                to toggle this help
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
