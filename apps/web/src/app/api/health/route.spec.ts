import { GET } from './route';

// Mock environment variables
const mockEnv = {
  NODE_ENV: 'test' as const,
  NEXT_PUBLIC_APP_VERSION: '1.0.0',
};

describe('/api/health', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
    Object.assign(process.env, mockEnv);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('GET', () => {
    it('should return health status with correct structure', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: 'healthy',
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        version: '1.0.0',
        services: {
          core: 'operational',
          ui: 'operational',
          api: 'operational',
        },
        environment: 'non-production',
      });
    });

    it('should return production environment for NODE_ENV=production', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

      const response = await GET();
      const data = await response.json();

      expect(data.environment).toBe('production');

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, writable: true });
    });

    it('should return non-production environment for development', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      const response = await GET();
      const data = await response.json();

      expect(data.environment).toBe('non-production');

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, writable: true });
    });

    it('should include cache control headers', async () => {
      const response = await GET();

      expect(response.headers.get('Cache-Control')).toBe(
        'no-store, no-cache, must-revalidate, max-age=0'
      );
    });

    it('should use default version when NEXT_PUBLIC_APP_VERSION is not set', async () => {
      const originalVersion = process.env['NEXT_PUBLIC_APP_VERSION'];
      delete process.env['NEXT_PUBLIC_APP_VERSION'];

      const response = await GET();
      const data = await response.json();

      expect(data.version).toBe('1.0.0');

      if (originalVersion) {
        process.env['NEXT_PUBLIC_APP_VERSION'] = originalVersion;
      }
    });

    it('should have valid timestamp format', async () => {
      const response = await GET();
      const data = await response.json();

      const timestamp = new Date(data.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000); // Within last second
    });

    it('should have all required services operational', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.services).toEqual({
        core: 'operational',
        ui: 'operational',
        api: 'operational',
      });
    });
  });
});
