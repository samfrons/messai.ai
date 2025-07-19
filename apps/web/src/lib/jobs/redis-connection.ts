import Redis from 'ioredis';

// Lazy Redis connection for BullMQ
// Only create connection when actually needed, not during build
let _redisConnection: Redis | null = null;

function createRedisConnection(): Redis {
  const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    db: parseInt(process.env.REDIS_DB || '0'),
    // Connection retry strategy
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  // Handle connection events
  connection.on('connect', () => {
    console.log('✅ Redis connected for job queue');
  });

  connection.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });

  connection.on('close', () => {
    console.log('🔌 Redis connection closed');
  });

  return connection;
}

// Lazy getter for Redis connection
export function getRedisConnection(): Redis {
  if (!_redisConnection) {
    _redisConnection = createRedisConnection();
  }
  return _redisConnection;
}

// For backward compatibility
export const redisConnection = new Proxy({} as Redis, {
  get(target, prop) {
    return getRedisConnection()[prop as keyof Redis];
  },
});
