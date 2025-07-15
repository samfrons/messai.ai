'use client';

import { useState } from 'react';
import { Button, Badge } from '@messai/ui';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  badge?: string;
}

export default function EnhancedNavigation() {
  const [activeTab, setActiveTab] = useState('models');

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'research', label: 'Research Enhanced', icon: '🔬', badge: 'New' },
    { id: 'parameters', label: 'Parameters', icon: '⚙️' },
    { id: 'models', label: 'Models', icon: '🧬', active: true },
    { id: 'experiments', label: 'Experiments', icon: '🧪' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="text-xl font-serif font-light">MESSAi Lab</div>
            <nav className="flex items-center gap-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(item.id)}
                  className="relative"
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <Badge
                      variant="outline"
                      size="sm"
                      className="ml-2 bg-blue-50 text-blue-600 border-blue-200"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <span className="mr-2">💾</span>
              Save Project
            </Button>
            <Button variant="outline" size="sm">
              <span className="mr-2">📤</span>
              Export
            </Button>
            <Button variant="outline" size="sm">
              <span className="mr-2">👥</span>
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
