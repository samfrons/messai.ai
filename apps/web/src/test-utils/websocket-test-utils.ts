import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from 'http';
import { AddressInfo } from 'net';

/**
 * Mock WebSocket server for testing
 */
export class MockWebSocketServer {
  private httpServer: any;
  private io: SocketIOServer;
  private port: number = 0;
  private clients: Map<string, ClientSocket> = new Map();

  constructor() {
    this.httpServer = createServer();
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
  }

  /**
   * Start the mock server
   */
  async start(): Promise<number> {
    return new Promise((resolve) => {
      this.httpServer.listen(0, () => {
        this.port = (this.httpServer.address() as AddressInfo).port;
        resolve(this.port);
      });
    });
  }

  /**
   * Stop the mock server
   */
  async stop(): Promise<void> {
    // Disconnect all clients
    for (const client of this.clients.values()) {
      client.disconnect();
    }
    this.clients.clear();

    // Close the server
    return new Promise((resolve) => {
      this.io.close(() => {
        this.httpServer.close(() => {
          resolve();
        });
      });
    });
  }

  /**
   * Get the WebSocket server instance
   */
  getServer(): SocketIOServer {
    return this.io;
  }

  /**
   * Get the server URL
   */
  getUrl(): string {
    return `http://localhost:${this.port}`;
  }

  /**
   * Create a test client
   */
  createClient(namespace = '/'): ClientSocket {
    const client = ioClient(`${this.getUrl()}${namespace}`, {
      transports: ['websocket'],
      autoConnect: false,
    });
    this.clients.set(client.id, client);
    return client;
  }

  /**
   * Wait for a client to connect
   */
  async waitForConnection(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      this.io.once('connection', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  /**
   * Emit an event to all connected clients
   */
  emit(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Emit an event to a specific room
   */
  emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  /**
   * Get all connected sockets
   */
  async getConnectedSockets(): Promise<string[]> {
    const sockets = await this.io.fetchSockets();
    return sockets.map((socket) => socket.id);
  }
}

/**
 * WebSocket client test utilities
 */
export class WebSocketTestClient {
  private socket: ClientSocket;
  private receivedEvents: Array<{ event: string; data: any; timestamp: number }> = [];
  private eventListeners: Map<string, (data: any) => void> = new Map();

  constructor(socket: ClientSocket) {
    this.socket = socket;
    this.setupEventCapture();
  }

  /**
   * Connect the client
   */
  async connect(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, timeout);

      this.socket.once('connect', () => {
        clearTimeout(timer);
        resolve();
      });

      this.socket.connect();
    });
  }

  /**
   * Disconnect the client
   */
  disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Emit an event
   */
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  /**
   * Emit an event and wait for acknowledgment
   */
  async emitWithAck(event: string, data?: any, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Acknowledgment timeout for event: ${event}`));
      }, timeout);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timer);
        resolve(response);
      });
    });
  }

  /**
   * Wait for a specific event
   */
  async waitForEvent(event: string, timeout = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for event: ${event}`));
      }, timeout);

      const handler = (data: any) => {
        clearTimeout(timer);
        this.socket.off(event, handler);
        resolve(data);
      };

      this.socket.on(event, handler);
    });
  }

  /**
   * Wait for multiple events in order
   */
  async waitForEvents(events: string[], timeout = 5000): Promise<any[]> {
    const results: any[] = [];

    for (const event of events) {
      const data = await this.waitForEvent(event, timeout);
      results.push(data);
    }

    return results;
  }

  /**
   * Get all received events
   */
  getReceivedEvents(): Array<{ event: string; data: any; timestamp: number }> {
    return [...this.receivedEvents];
  }

  /**
   * Get events of a specific type
   */
  getEventsByType(event: string): any[] {
    return this.receivedEvents.filter((e) => e.event === event).map((e) => e.data);
  }

  /**
   * Clear received events
   */
  clearReceivedEvents(): void {
    this.receivedEvents = [];
  }

  /**
   * Assert that an event was received
   */
  assertEventReceived(event: string, expectedData?: any): void {
    const events = this.getEventsByType(event);

    if (events.length === 0) {
      throw new Error(`Expected event "${event}" was not received`);
    }

    if (expectedData !== undefined) {
      const found = events.some((data) => JSON.stringify(data) === JSON.stringify(expectedData));

      if (!found) {
        throw new Error(
          `Event "${event}" was received but with different data. Expected: ${JSON.stringify(
            expectedData
          )}, Received: ${JSON.stringify(events)}`
        );
      }
    }
  }

  /**
   * Assert that an event was not received
   */
  assertEventNotReceived(event: string): void {
    const events = this.getEventsByType(event);

    if (events.length > 0) {
      throw new Error(
        `Expected event "${event}" to not be received, but it was received ${events.length} time(s)`
      );
    }
  }

  /**
   * Get the underlying socket
   */
  getSocket(): ClientSocket {
    return this.socket;
  }

  /**
   * Join a room (server-side simulation)
   */
  joinRoom(room: string): void {
    this.emit('join-room', room);
  }

  /**
   * Leave a room (server-side simulation)
   */
  leaveRoom(room: string): void {
    this.emit('leave-room', room);
  }

  private setupEventCapture(): void {
    const originalEmit = this.socket.emit;
    const originalOn = this.socket.on;

    // Capture all incoming events
    this.socket.onAny((event: string, ...args: any[]) => {
      this.receivedEvents.push({
        event,
        data: args[0],
        timestamp: Date.now(),
      });
    });
  }
}

/**
 * Create a mock WebSocket test environment
 */
export async function createWebSocketTestEnvironment() {
  const server = new MockWebSocketServer();
  const port = await server.start();

  return {
    server,
    port,
    url: server.getUrl(),

    createClient: (namespace = '/') => {
      const socket = server.createClient(namespace);
      return new WebSocketTestClient(socket);
    },

    cleanup: async () => {
      await server.stop();
    },
  };
}

/**
 * Test helper for WebSocket store integration
 */
export function mockWebSocketStore() {
  const events: Array<{ type: string; payload: any }> = [];

  return {
    emit: jest.fn((type: string, payload: any) => {
      events.push({ type, payload });
    }),

    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),

    getEvents: () => [...events],
    clearEvents: () => events.splice(0, events.length),

    simulateEvent: (type: string, payload: any) => {
      const listeners = (global as any).mockWebSocketListeners || {};
      if (listeners[type]) {
        listeners[type].forEach((fn: Function) => fn(payload));
      }
    },
  };
}

/**
 * Test scenarios for WebSocket functionality
 */
export const WebSocketTestScenarios = {
  /**
   * Test connection establishment
   */
  async testConnection(client: WebSocketTestClient): Promise<void> {
    await client.connect();
    expect(client.getSocket().connected).toBe(true);
  },

  /**
   * Test reconnection
   */
  async testReconnection(client: WebSocketTestClient, server: MockWebSocketServer): Promise<void> {
    await client.connect();
    client.disconnect();
    expect(client.getSocket().connected).toBe(false);

    await client.connect();
    expect(client.getSocket().connected).toBe(true);
  },

  /**
   * Test room functionality
   */
  async testRooms(
    client1: WebSocketTestClient,
    client2: WebSocketTestClient,
    server: MockWebSocketServer
  ): Promise<void> {
    await Promise.all([client1.connect(), client2.connect()]);

    // Setup room handlers on server
    server.getServer().on('connection', (socket) => {
      socket.on('join-room', (room) => {
        socket.join(room);
      });
    });

    // Client 1 joins a room
    client1.joinRoom('test-room');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Server emits to room
    server.emitToRoom('test-room', 'room-message', { text: 'Hello room' });

    // Client 1 should receive the message
    const data = await client1.waitForEvent('room-message');
    expect(data).toEqual({ text: 'Hello room' });

    // Client 2 should not receive the message
    client2.assertEventNotReceived('room-message');
  },

  /**
   * Test error handling
   */
  async testErrorHandling(client: WebSocketTestClient): Promise<void> {
    const errorHandler = jest.fn();
    client.getSocket().on('error', errorHandler);

    // Simulate error
    client.getSocket().emit('error', new Error('Test error'));

    expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
  },
};
