'use client';

import { useState, useCallback } from 'react';

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  timestamp: Date;
  parameters: Record<string, any>;
  notes?: string;
  isAutoSave?: boolean;
}

export interface ModelVersioning {
  versions: ModelVersion[];
  currentVersion: string | null;
  hasUnsavedChanges: boolean;
}

export function useModelVersioning() {
  const [versioning, setVersioning] = useState<ModelVersioning>({
    versions: [],
    currentVersion: null,
    hasUnsavedChanges: false,
  });

  const saveVersion = useCallback(
    (name: string, parameters: Record<string, any>, notes?: string, isAutoSave = false) => {
      const newVersion: ModelVersion = {
        id: `v${Date.now()}`,
        name,
        version: `v${versioning.versions.length + 1}.0`,
        timestamp: new Date(),
        parameters: { ...parameters },
        ...(notes && { notes }),
        isAutoSave,
      };

      setVersioning((prev) => ({
        ...prev,
        versions: [...prev.versions, newVersion],
        currentVersion: newVersion.id,
        hasUnsavedChanges: false,
      }));

      return newVersion;
    },
    [versioning.versions.length]
  );

  const loadVersion = useCallback(
    (versionId: string) => {
      const version = versioning.versions.find((v) => v.id === versionId);
      if (version) {
        setVersioning((prev) => ({
          ...prev,
          currentVersion: versionId,
          hasUnsavedChanges: false,
        }));
        return version;
      }
      return null;
    },
    [versioning.versions]
  );

  const deleteVersion = useCallback((versionId: string) => {
    setVersioning((prev) => ({
      ...prev,
      versions: prev.versions.filter((v) => v.id !== versionId),
      currentVersion: prev.currentVersion === versionId ? null : prev.currentVersion,
    }));
  }, []);

  const markAsChanged = useCallback(() => {
    setVersioning((prev) => ({
      ...prev,
      hasUnsavedChanges: true,
    }));
  }, []);

  const compareVersions = useCallback(
    (versionId1: string, versionId2: string) => {
      const version1 = versioning.versions.find((v) => v.id === versionId1);
      const version2 = versioning.versions.find((v) => v.id === versionId2);

      if (!version1 || !version2) return null;

      const differences: { key: string; value1: any; value2: any }[] = [];
      const allKeys = new Set([
        ...Object.keys(version1.parameters),
        ...Object.keys(version2.parameters),
      ]);

      allKeys.forEach((key) => {
        const val1 = version1.parameters[key];
        const val2 = version2.parameters[key];

        if (val1 !== val2) {
          differences.push({ key, value1: val1, value2: val2 });
        }
      });

      return {
        version1,
        version2,
        differences,
      };
    },
    [versioning.versions]
  );

  const getCurrentVersion = useCallback(() => {
    if (!versioning.currentVersion) return null;
    return versioning.versions.find((v) => v.id === versioning.currentVersion) || null;
  }, [versioning.currentVersion, versioning.versions]);

  const createBranch = useCallback(
    (fromVersionId: string, branchName: string) => {
      const sourceVersion = versioning.versions.find((v) => v.id === fromVersionId);
      if (!sourceVersion) return null;

      const branchVersion: ModelVersion = {
        id: `branch-${Date.now()}`,
        name: branchName,
        version: `${sourceVersion.version}-${branchName}`,
        timestamp: new Date(),
        parameters: { ...sourceVersion.parameters },
        notes: `Branched from ${sourceVersion.name}`,
      };

      setVersioning((prev) => ({
        ...prev,
        versions: [...prev.versions, branchVersion],
        currentVersion: branchVersion.id,
        hasUnsavedChanges: false,
      }));

      return branchVersion;
    },
    [versioning.versions]
  );

  const exportVersion = useCallback(
    (versionId: string) => {
      const version = versioning.versions.find((v) => v.id === versionId);
      if (!version) return null;

      const exportData = {
        ...version,
        exportedAt: new Date().toISOString(),
        exportedBy: 'MESSAi Lab-IO',
      };

      // Create download link
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `${version.name}_${version.version}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      return exportData;
    },
    [versioning.versions]
  );

  const importVersion = useCallback((versionData: ModelVersion) => {
    const importedVersion: ModelVersion = {
      ...versionData,
      id: `imported-${Date.now()}`,
      timestamp: new Date(),
      name: `${versionData.name} (Imported)`,
    };

    setVersioning((prev) => ({
      ...prev,
      versions: [...prev.versions, importedVersion],
      currentVersion: importedVersion.id,
      hasUnsavedChanges: false,
    }));

    return importedVersion;
  }, []);

  return {
    versioning,
    saveVersion,
    loadVersion,
    deleteVersion,
    markAsChanged,
    compareVersions,
    getCurrentVersion,
    createBranch,
    exportVersion,
    importVersion,
  };
}
