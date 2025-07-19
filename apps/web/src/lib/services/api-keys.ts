import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  tier: 'free' | 'premium' | 'enterprise';
  userId: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: string;
  };
}

export interface CreateApiKeyInput {
  name: string;
  tier?: 'free' | 'premium' | 'enterprise';
  permissions?: string[];
  expiresIn?: number; // Days
  userId: string;
}

// In-memory storage for demo (replace with database in production)
const apiKeysStore = new Map<string, ApiKey>();
const keyToIdMap = new Map<string, string>();

const RATE_LIMITS = {
  free: { requests: 1000, window: '15m' },
  premium: { requests: 10000, window: '15m' },
  enterprise: { requests: 100000, window: '15m' },
};

export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKey> {
  const id = uuidv4();
  const key = `sk_${input.tier || 'free'}_${randomBytes(32).toString('hex')}`;

  const apiKey: ApiKey = {
    id,
    key,
    name: input.name,
    tier: input.tier || 'free',
    userId: input.userId,
    createdAt: new Date(),
    lastUsedAt: null,
    expiresAt: input.expiresIn
      ? new Date(Date.now() + input.expiresIn * 24 * 60 * 60 * 1000)
      : null,
    permissions: input.permissions || ['read'],
    rateLimit: RATE_LIMITS[input.tier || 'free'],
  };

  apiKeysStore.set(id, apiKey);
  keyToIdMap.set(key, id);

  return apiKey;
}

export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  const keys: ApiKey[] = [];

  for (const apiKey of apiKeysStore.values()) {
    if (apiKey.userId === userId) {
      // Mask the key for security
      keys.push({
        ...apiKey,
        key: maskApiKey(apiKey.key),
      });
    }
  }

  return keys;
}

export async function getApiKeyById(id: string, userId: string): Promise<ApiKey | null> {
  const apiKey = apiKeysStore.get(id);

  if (!apiKey || apiKey.userId !== userId) {
    return null;
  }

  return {
    ...apiKey,
    key: maskApiKey(apiKey.key),
  };
}

export async function deleteApiKey(id: string, userId: string): Promise<boolean> {
  const apiKey = apiKeysStore.get(id);

  if (!apiKey || apiKey.userId !== userId) {
    return false;
  }

  apiKeysStore.delete(id);
  keyToIdMap.delete(apiKey.key);

  return true;
}

export async function validateApiKey(key: string): Promise<ApiKey | null> {
  const id = keyToIdMap.get(key);

  if (!id) {
    return null;
  }

  const apiKey = apiKeysStore.get(id);

  if (!apiKey) {
    return null;
  }

  // Check if expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update last used
  apiKey.lastUsedAt = new Date();
  apiKeysStore.set(id, apiKey);

  return apiKey;
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return key;
  return key.substring(0, 8) + '...' + key.substring(key.length - 4);
}

// Initialize with some demo keys for testing
export function initializeDemoKeys() {
  const demoUserId = 'demo-user';

  createApiKey({
    name: 'Demo Free Key',
    tier: 'free',
    userId: demoUserId,
  });

  createApiKey({
    name: 'Demo Premium Key',
    tier: 'premium',
    userId: demoUserId,
    permissions: ['read', 'write'],
  });
}
