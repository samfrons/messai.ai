import Redis from 'ioredis';

// Redis connection for BullMQ
// In production, use environment variables for configuration
const redisConnection = new Redis({
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
redisConnection.on('connect', () => {
  console.log('✅ Redis connected for job queue');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisConnection.on('close', () => {
  console.log('🔌 Redis connection closed');
});

export { redisConnection };
