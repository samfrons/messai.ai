import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  userId: string;
  createdAt: Date;
  lastTriggeredAt: Date | null;
}

export interface CreateWebhookInput {
  url: string;
  events: string[];
  secret?: string;
  userId: string;
}

// In-memory storage for demo (replace with database in production)
const webhooksStore = new Map<string, Webhook>();

export async function createWebhook(input: CreateWebhookInput): Promise<Webhook> {
  const id = uuidv4();
  const secret = input.secret || randomBytes(32).toString('hex');

  const webhook: Webhook = {
    id,
    url: input.url,
    events: input.events,
    secret,
    active: true,
    userId: input.userId,
    createdAt: new Date(),
    lastTriggeredAt: null,
  };

  webhooksStore.set(id, webhook);

  return webhook;
}

export async function getWebhooks(userId: string): Promise<Webhook[]> {
  const webhooks: Webhook[] = [];

  for (const webhook of webhooksStore.values()) {
    if (webhook.userId === userId) {
      webhooks.push({
        ...webhook,
        secret: maskSecret(webhook.secret),
      });
    }
  }

  return webhooks;
}

export async function getWebhookById(id: string, userId: string): Promise<Webhook | null> {
  const webhook = webhooksStore.get(id);

  if (!webhook || webhook.userId !== userId) {
    return null;
  }

  return {
    ...webhook,
    secret: maskSecret(webhook.secret),
  };
}

export async function updateWebhook(
  id: string,
  userId: string,
  updates: Partial<Pick<Webhook, 'url' | 'events' | 'active'>>
): Promise<Webhook | null> {
  const webhook = webhooksStore.get(id);

  if (!webhook || webhook.userId !== userId) {
    return null;
  }

  const updated = {
    ...webhook,
    ...updates,
  };

  webhooksStore.set(id, updated);

  return {
    ...updated,
    secret: maskSecret(updated.secret),
  };
}

export async function deleteWebhook(id: string, userId: string): Promise<boolean> {
  const webhook = webhooksStore.get(id);

  if (!webhook || webhook.userId !== userId) {
    return false;
  }

  webhooksStore.delete(id);

  return true;
}

export async function triggerWebhook(event: string, data: any): Promise<void> {
  // Find all webhooks subscribed to this event
  const webhooks = Array.from(webhooksStore.values()).filter(
    (webhook) => webhook.active && webhook.events.includes(event)
  );

  // Trigger webhooks in parallel
  await Promise.all(
    webhooks.map(async (webhook) => {
      try {
        const payload = JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        });

        const signature = createWebhookSignature(payload, webhook.secret);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body: payload,
        });

        if (response.ok) {
          webhook.lastTriggeredAt = new Date();
          webhooksStore.set(webhook.id, webhook);
        }
      } catch (error) {
        console.error(`Failed to trigger webhook ${webhook.id}:`, error);
      }
    })
  );
}

function maskSecret(secret: string): string {
  if (secret.length <= 8) return secret;
  return secret.substring(0, 8) + '...' + secret.substring(secret.length - 4);
}

function createWebhookSignature(payload: string, secret: string): string {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}
