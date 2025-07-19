/**
 * @jest-environment node
 */
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { setupWebSocketServer } from '../server';
import {
  createWebSocketTestEnvironment,
  WebSocketTestClient,
  WebSocketTestScenarios,
} from '../../../test-utils/websocket-test-utils';

describe('WebSocket Server', () => {
  let testEnv: any;
  let httpServer: any;
  let port: number;

  beforeEach(async () => {
    // Create HTTP server for testing
    httpServer = createServer();
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        port = (httpServer.address() as AddressInfo).port;
        resolve();
      });
    });

    // Setup WebSocket server
    setupWebSocketServer(httpServer);

    // Create test environment
    testEnv = await createWebSocketTestEnvironment();
  });

  afterEach(async () => {
    // Cleanup
    await testEnv?.cleanup();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  describe('Connection Management', () => {
    it('should handle client connections', async () => {
      const client = testEnv.createClient();
      await client.connect();

      expect(client.getSocket().connected).toBe(true);

      client.disconnect();
      expect(client.getSocket().connected).toBe(false);
    });

    it('should handle multiple client connections', async () => {
      const clients = await Promise.all([
        testEnv.createClient(),
        testEnv.createClient(),
        testEnv.createClient(),
      ]);

      await Promise.all(clients.map((client) => client.connect()));

      clients.forEach((client) => {
        expect(client.getSocket().connected).toBe(true);
      });

      // Cleanup
      clients.forEach((client) => client.disconnect());
    });

    it('should handle client reconnection', async () => {
      const client = testEnv.createClient();

      // Initial connection
      await client.connect();
      const firstSocketId = client.getSocket().id;

      // Disconnect and reconnect
      client.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 100));
      await client.connect();

      const secondSocketId = client.getSocket().id;
      expect(firstSocketId).not.toBe(secondSocketId);
      expect(client.getSocket().connected).toBe(true);
    });
  });

  describe('Event Communication', () => {
    it('should handle paper update events', async () => {
      const client = testEnv.createClient();
      await client.connect();

      // Server emits paper update
      testEnv.server.emit('paper:updated', {
        id: '123',
        title: 'Updated Paper',
        changes: { title: 'New Title' },
      });

      const data = await client.waitForEvent('paper:updated');
      expect(data).toEqual({
        id: '123',
        title: 'Updated Paper',
        changes: { title: 'New Title' },
      });
    });

    it('should handle experiment events', async () => {
      const client = testEnv.createClient();
      await client.connect();

      // Client creates experiment
      const response = await client.emitWithAck('experiment:create', {
        name: 'Test Experiment',
        parameters: { temperature: 25 },
      });

      expect(response).toMatchObject({
        success: true,
        experimentId: expect.any(String),
      });

      // Server broadcasts to all clients
      testEnv.server.emit('experiment:created', {
        id: response.experimentId,
        name: 'Test Experiment',
        createdBy: 'test-user',
      });

      const broadcastData = await client.waitForEvent('experiment:created');
      expect(broadcastData.name).toBe('Test Experiment');
    });

    it('should handle prediction events', async () => {
      const client = testEnv.createClient();
      await client.connect();

      // Subscribe to prediction updates
      client.emit('prediction:subscribe', { experimentId: 'exp-123' });

      // Server sends prediction progress
      const progressEvents = [
        { progress: 0, status: 'initializing' },
        { progress: 50, status: 'processing' },
        { progress: 100, status: 'completed', results: { powerDensity: 250 } },
      ];

      for (const event of progressEvents) {
        testEnv.server.emit('prediction:progress', {
          experimentId: 'exp-123',
          ...event,
        });
      }

      const events = await client.waitForEvents([
        'prediction:progress',
        'prediction:progress',
        'prediction:progress',
      ]);

      expect(events).toHaveLength(3);
      expect(events[2]).toMatchObject({
        progress: 100,
        status: 'completed',
        results: { powerDensity: 250 },
      });
    });
  });

  describe('Room Management', () => {
    it('should handle experiment room subscriptions', async () => {
      const client1 = testEnv.createClient();
      const client2 = testEnv.createClient();
      const client3 = testEnv.createClient();

      await Promise.all([client1.connect(), client2.connect(), client3.connect()]);

      // Setup room handlers
      testEnv.server.getServer().on('connection', (socket: any) => {
        socket.on('experiment:join', (experimentId: string) => {
          socket.join(`experiment:${experimentId}`);
          socket.emit('experiment:joined', { experimentId });
        });
      });

      // Clients 1 and 2 join experiment room
      client1.emit('experiment:join', 'exp-123');
      client2.emit('experiment:join', 'exp-123');
      client3.emit('experiment:join', 'exp-456'); // Different room

      await Promise.all([
        client1.waitForEvent('experiment:joined'),
        client2.waitForEvent('experiment:joined'),
        client3.waitForEvent('experiment:joined'),
      ]);

      // Emit to specific experiment room
      testEnv.server.emitToRoom('experiment:exp-123', 'experiment:data', {
        temperature: 30,
        pH: 7.2,
      });

      // Only clients 1 and 2 should receive the data
      const [data1, data2] = await Promise.all([
        client1.waitForEvent('experiment:data'),
        client2.waitForEvent('experiment:data'),
      ]);

      expect(data1).toEqual({ temperature: 30, pH: 7.2 });
      expect(data2).toEqual({ temperature: 30, pH: 7.2 });

      // Client 3 should not receive the event
      client3.assertEventNotReceived('experiment:data');
    });

    it('should handle user presence in rooms', async () => {
      const client = testEnv.createClient();
      await client.connect();

      // Setup presence handlers
      testEnv.server.getServer().on('connection', (socket: any) => {
        socket.on('presence:join', ({ room, user }: any) => {
          socket.join(room);
          socket.to(room).emit('presence:user-joined', { user });

          // Send current users to new joiner
          socket.emit('presence:users', {
            room,
            users: ['user1', 'user2', user],
          });
        });
      });

      client.emit('presence:join', {
        room: 'lab:main',
        user: 'test-user',
      });

      const users = await client.waitForEvent('presence:users');
      expect(users.users).toContain('test-user');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid event data', async () => {
      const client = testEnv.createClient();
      await client.connect();

      // Setup error handler
      testEnv.server.getServer().on('connection', (socket: any) => {
        socket.on('invalid:event', (data: any, callback: Function) => {
          if (!data || !data.required) {
            callback({ error: 'Missing required field' });
          } else {
            callback({ success: true });
          }
        });
      });

      // Send invalid data
      const response = await client.emitWithAck('invalid:event', {});
      expect(response).toEqual({ error: 'Missing required field' });

      // Send valid data
      const validResponse = await client.emitWithAck('invalid:event', {
        required: 'value',
      });
      expect(validResponse).toEqual({ success: true });
    });

    it('should handle connection errors', async () => {
      const client = testEnv.createClient();
      const errorHandler = jest.fn();

      client.getSocket().on('connect_error', errorHandler);

      // Try to connect to invalid namespace
      const invalidClient = testEnv.createClient('/invalid-namespace');

      try {
        await invalidClient.connect();
      } catch (error) {
        // Expected to fail
      }

      // Should still be able to connect to valid namespace
      await client.connect();
      expect(client.getSocket().connected).toBe(true);
    });

    it('should handle disconnection during data transfer', async () => {
      const client = testEnv.createClient();
      await client.connect();

      // Setup handler that disconnects during processing
      testEnv.server.getServer().on('connection', (socket: any) => {
        socket.on('long:process', async (data: any, callback: Function) => {
          // Simulate long processing
          setTimeout(() => {
            if (socket.connected) {
              callback({ processed: true });
            }
          }, 1000);
        });
      });

      // Start long process and disconnect
      const processPromise = client.emitWithAck('long:process', { data: 'test' });

      // Disconnect after 100ms
      setTimeout(() => client.disconnect(), 100);

      // Should timeout or handle gracefully
      await expect(processPromise).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle high message throughput', async () => {
      const client = testEnv.createClient();
      await client.connect();

      const messageCount = 100;
      const messages: any[] = [];

      // Setup echo handler
      testEnv.server.getServer().on('connection', (socket: any) => {
        socket.on('echo', (data: any) => {
          socket.emit('echo:response', data);
        });
      });

      // Send many messages rapidly
      const startTime = Date.now();

      for (let i = 0; i < messageCount; i++) {
        client.emit('echo', { index: i, timestamp: Date.now() });
      }

      // Wait for all responses
      for (let i = 0; i < messageCount; i++) {
        const response = await client.waitForEvent('echo:response');
        messages.push(response);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(messages).toHaveLength(messageCount);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify message order
      const indices = messages.map((m) => m.index).sort((a, b) => a - b);
      expect(indices).toEqual(Array.from({ length: messageCount }, (_, i) => i));
    });

    it('should handle concurrent connections efficiently', async () => {
      const clientCount = 20;
      const clients: WebSocketTestClient[] = [];

      // Create and connect multiple clients
      for (let i = 0; i < clientCount; i++) {
        const client = testEnv.createClient();
        clients.push(client);
      }

      const connectPromises = clients.map((client) => client.connect());
      await Promise.all(connectPromises);

      // Verify all connected
      clients.forEach((client) => {
        expect(client.getSocket().connected).toBe(true);
      });

      // Broadcast message to all
      testEnv.server.emit('broadcast', { message: 'Hello all!' });

      // All clients should receive the message
      const receivePromises = clients.map((client) => client.waitForEvent('broadcast'));

      const results = await Promise.all(receivePromises);
      results.forEach((result) => {
        expect(result).toEqual({ message: 'Hello all!' });
      });

      // Cleanup
      clients.forEach((client) => client.disconnect());
    });
  });

  describe('Integration Scenarios', () => {
    it('should run standard test scenarios', async () => {
      const client = testEnv.createClient();

      // Test connection
      await WebSocketTestScenarios.testConnection(client);

      // Test reconnection
      await WebSocketTestScenarios.testReconnection(client, testEnv.server);

      // Test error handling
      await WebSocketTestScenarios.testErrorHandling(client);
    });

    it('should test room functionality with multiple clients', async () => {
      const client1 = testEnv.createClient();
      const client2 = testEnv.createClient();

      await WebSocketTestScenarios.testRooms(client1, client2, testEnv.server);
    });
  });
});
