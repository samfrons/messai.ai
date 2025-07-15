'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@messai/ui';

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'export' | 'analysis' | 'integration' | 'collaboration';
  status: 'available' | 'premium' | 'coming-soon';
  action: () => void;
}

export default function ToolsIntegrationPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('export');

  const tools: Tool[] = [
    // Export Tools
    {
      id: 'export-stl',
      name: 'Export STL',
      icon: '📐',
      description: 'Export 3D model as STL file for 3D printing',
      category: 'export',
      status: 'available',
      action: () => console.log('Exporting STL...'),
    },
    {
      id: 'export-obj',
      name: 'Export OBJ',
      icon: '📦',
      description: 'Export 3D model as OBJ file',
      category: 'export',
      status: 'available',
      action: () => console.log('Exporting OBJ...'),
    },
    {
      id: 'export-cad',
      name: 'CAD Export',
      icon: '🔧',
      description: 'Export to CAD software (SolidWorks, AutoCAD)',
      category: 'export',
      status: 'premium',
      action: () => console.log('Exporting to CAD...'),
    },
    {
      id: 'export-pdf',
      name: 'Technical Drawing',
      icon: '📄',
      description: 'Generate technical drawings and blueprints',
      category: 'export',
      status: 'available',
      action: () => console.log('Generating PDF...'),
    },

    // Analysis Tools
    {
      id: 'performance-analysis',
      name: 'Performance Analysis',
      icon: '📊',
      description: 'Detailed performance metrics and optimization',
      category: 'analysis',
      status: 'available',
      action: () => console.log('Running performance analysis...'),
    },
    {
      id: 'doe-analysis',
      name: 'DOE Analysis',
      icon: '🧪',
      description: 'Design of Experiments statistical analysis',
      category: 'analysis',
      status: 'premium',
      action: () => console.log('Running DOE analysis...'),
    },
    {
      id: 'optimization',
      name: 'Parameter Optimization',
      icon: '⚡',
      description: 'AI-powered parameter optimization',
      category: 'analysis',
      status: 'available',
      action: () => console.log('Running optimization...'),
    },
    {
      id: 'sensitivity',
      name: 'Sensitivity Analysis',
      icon: '🎯',
      description: 'Parameter sensitivity and impact analysis',
      category: 'analysis',
      status: 'available',
      action: () => console.log('Running sensitivity analysis...'),
    },

    // Integration Tools
    {
      id: 'matlab-integration',
      name: 'MATLAB Integration',
      icon: '🔗',
      description: 'Connect to MATLAB for advanced analysis',
      category: 'integration',
      status: 'premium',
      action: () => console.log('Connecting to MATLAB...'),
    },
    {
      id: 'python-notebook',
      name: 'Python Notebook',
      icon: '🐍',
      description: 'Export to Jupyter notebook for analysis',
      category: 'integration',
      status: 'available',
      action: () => console.log('Exporting to Python notebook...'),
    },
    {
      id: 'comsol-integration',
      name: 'COMSOL Integration',
      icon: '🔬',
      description: 'Export to COMSOL for FEA simulation',
      category: 'integration',
      status: 'coming-soon',
      action: () => console.log('COMSOL integration coming soon...'),
    },

    // Collaboration Tools
    {
      id: 'share-link',
      name: 'Share Link',
      icon: '🔗',
      description: 'Generate shareable link for collaboration',
      category: 'collaboration',
      status: 'available',
      action: () => console.log('Generating share link...'),
    },
    {
      id: 'team-workspace',
      name: 'Team Workspace',
      icon: '👥',
      description: 'Collaborative workspace for team projects',
      category: 'collaboration',
      status: 'premium',
      action: () => console.log('Opening team workspace...'),
    },
    {
      id: 'peer-review',
      name: 'Peer Review',
      icon: '👁️',
      description: 'Submit for peer review and feedback',
      category: 'collaboration',
      status: 'available',
      action: () => console.log('Submitting for peer review...'),
    },
  ];

  const categories = [
    { id: 'export', label: 'Export', icon: '📤' },
    { id: 'analysis', label: 'Analysis', icon: '🔍' },
    { id: 'integration', label: 'Integration', icon: '🔗' },
    { id: 'collaboration', label: 'Collaboration', icon: '👥' },
  ];

  const filteredTools = tools.filter((tool) => tool.category === activeCategory);

  const getStatusColor = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'coming-soon':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Tool['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'premium':
        return 'Premium';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return 'Unknown';
    }
  };

  const renderTool = (tool: Tool) => (
    <div key={tool.id} className="p-3 border rounded-lg hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tool.icon}</span>
          <h4 className="font-medium text-sm">{tool.name}</h4>
        </div>
        <Badge size="sm" className={getStatusColor(tool.status)}>
          {getStatusLabel(tool.status)}
        </Badge>
      </div>

      <p className="text-xs text-gray-600 mb-3">{tool.description}</p>

      <Button
        size="sm"
        variant="outline"
        onClick={tool.action}
        disabled={tool.status === 'coming-soon'}
        fullWidth
      >
        {tool.status === 'coming-soon' ? 'Coming Soon' : 'Use Tool'}
      </Button>
    </div>
  );

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white shadow-lg"
        >
          <span className="mr-2">🛠️</span>
          Tools
          <Badge variant="outline" size="sm" className="ml-2">
            {tools.length}
          </Badge>
        </Button>
      </div>

      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Integration Tools</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 mb-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="text-xs"
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Tools List */}
            <div className="space-y-2">{filteredTools.map(renderTool)}</div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {filteredTools.filter((t) => t.status === 'available').length} available
                </span>
                <span>{filteredTools.filter((t) => t.status === 'premium').length} premium</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
