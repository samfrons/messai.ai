'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ApiKey {
  id: string;
  key: string;
  name: string;
  tier: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface UsageStats {
  period: { start: string; end: string };
  requests: { total: number; successful: number; failed: number };
  quota: { limit: number; used: number; remaining: number };
}

export default function DevelopersPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchApiKeys();
      fetchUsageStats();
    }
  }, [session]);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/v1/usage');
      if (response.ok) {
        const data = await response.json();
        setUsageStats(data);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setApiKeys([...apiKeys, newKey]);
        setShowCreateModal(false);
        setNewKeyName('');
        alert(
          `API Key created: ${newKey.key}\n\nPlease save this key securely. You won't be able to see it again.`
        );
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      const response = await fetch(`/api/v1/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== id));
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const downloadSDK = async () => {
    try {
      const response = await fetch('/api/v1/sdk?format=typescript');
      const data = await response.json();

      // Create a simple download of the SDK files
      const content = Object.entries(data.files)
        .map(([filename, code]) => `// ${filename}\n${code}`)
        .join('\n\n');

      const blob = new Blob([content], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'messai-sdk.ts';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading SDK:', error);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Developer Portal</h1>
          <p className="text-gray-600">Please sign in to access the developer portal.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Developer Portal</h1>
        <p className="text-lg text-gray-600">
          Manage your API keys, view usage statistics, and download SDKs.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <a
          href="/api-docs"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">API Documentation</h3>
          <p className="text-gray-600">
            Explore our interactive API documentation with Swagger UI.
          </p>
        </a>

        <button
          onClick={downloadSDK}
          className="block w-full text-left p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">Download SDK</h3>
          <p className="text-gray-600">
            Get our TypeScript SDK with React hooks for easy integration.
          </p>
        </button>

        <a
          href="/api/openapi.json"
          target="_blank"
          className="block p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">OpenAPI Spec</h3>
          <p className="text-gray-600">Download the OpenAPI specification for code generation.</p>
        </a>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Usage Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold">{usageStats.requests.total}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">
                {usageStats.requests.total > 0
                  ? Math.round((usageStats.requests.successful / usageStats.requests.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quota Used</p>
              <p className="text-2xl font-bold">
                {usageStats.quota.used} / {usageStats.quota.limit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold">{usageStats.quota.remaining}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">API Keys</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Key
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-gray-600">No API keys yet. Create one to get started.</p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{key.name}</h3>
                    <p className="text-sm text-gray-600 font-mono">{key.key}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tier: {key.tier} • Created: {new Date(key.createdAt).toLocaleDateString()}
                      {key.lastUsedAt &&
                        ` • Last used: ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Create API Key</h3>
            <input
              type="text"
              placeholder="Key name (e.g., Production App)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewKeyName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createApiKey}
                disabled={!newKeyName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
