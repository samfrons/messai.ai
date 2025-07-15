'use client';

import { useState } from 'react';
import { Card, Button, Badge } from '@messai/ui';
import { useModelVersioning, type ModelVersion } from '../hooks/useModelVersioning';

interface ModelVersioningProps {
  currentParameters: Record<string, any>;
  onLoadVersion: (parameters: Record<string, any>) => void;
}

export default function ModelVersioning({
  currentParameters,
  onLoadVersion,
}: ModelVersioningProps) {
  const {
    versioning,
    saveVersion,
    loadVersion,
    deleteVersion,
    compareVersions,
    createBranch,
    exportVersion,
  } = useModelVersioning();

  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const handleSaveVersion = () => {
    const name = prompt('Enter version name:');
    if (name) {
      const notes = prompt('Enter version notes (optional):');
      saveVersion(name, currentParameters, notes || undefined);
    }
  };

  const handleLoadVersion = (versionId: string) => {
    const version = loadVersion(versionId);
    if (version) {
      onLoadVersion(version.parameters);
    }
  };

  const handleCreateBranch = (fromVersionId: string) => {
    const branchName = prompt('Enter branch name:');
    if (branchName && branchName.trim()) {
      createBranch(fromVersionId, branchName);
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      const version1 = selectedVersions[0];
      const version2 = selectedVersions[1];
      if (version1 && version2) {
        const comparison = compareVersions(version1, version2);
        if (comparison) {
          console.log('Comparison result:', comparison);
          // Future: Show comparison modal or panel
        }
      }
    }
  };

  const toggleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const renderVersion = (version: ModelVersion) => {
    const isSelected = selectedVersions.includes(version.id);
    const isCurrent = versioning.currentVersion === version.id;

    return (
      <div
        key={version.id}
        className={`p-3 border rounded-lg transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleVersionSelection(version.id)}
              className="w-4 h-4"
            />
            <h4 className="font-medium text-sm">{version.name}</h4>
            {version.isAutoSave && (
              <Badge variant="outline" size="sm" className="bg-gray-100">
                Auto
              </Badge>
            )}
            {isCurrent && (
              <Badge variant="outline" size="sm" className="bg-green-100 text-green-800">
                Current
              </Badge>
            )}
          </div>
          <Badge variant="ghost" size="sm">
            {version.version}
          </Badge>
        </div>

        <div className="text-xs text-gray-500 mb-2">{formatTimestamp(version.timestamp)}</div>

        {version.notes && <div className="text-xs text-gray-600 mb-2 italic">{version.notes}</div>}

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleLoadVersion(version.id)}
            disabled={isCurrent}
          >
            Load
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleCreateBranch(version.id)}>
            Branch
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportVersion(version.id)}>
            Export
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => deleteVersion(version.id)}
            disabled={isCurrent}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white shadow-lg"
        >
          <span className="mr-2">🔄</span>
          Versions
          {versioning.versions.length > 0 && (
            <Badge variant="outline" size="sm" className="ml-2">
              {versioning.versions.length}
            </Badge>
          )}
          {versioning.hasUnsavedChanges && (
            <Badge variant="outline" size="sm" className="ml-2 bg-yellow-50 text-yellow-600">
              Unsaved
            </Badge>
          )}
        </Button>
      </div>

      {isVisible && (
        <Card className="w-96 max-h-96 overflow-y-auto shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Model Versions</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveVersion}
                  disabled={!versioning.hasUnsavedChanges}
                >
                  Save
                </Button>
                {selectedVersions.length === 2 && (
                  <Button size="sm" variant="outline" onClick={handleCompareVersions}>
                    Compare
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {versioning.versions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No versions saved yet</p>
                  <Button size="sm" variant="outline" onClick={handleSaveVersion} className="mt-2">
                    Save current configuration
                  </Button>
                </div>
              ) : (
                versioning.versions.slice().reverse().map(renderVersion)
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Total versions: {versioning.versions.length}</span>
                <span>{versioning.currentVersion ? 'Current' : 'No version selected'}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
