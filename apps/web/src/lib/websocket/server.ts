import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../logger';

export interface WebSocketEvents {
  // Paper events
  'paper:created': (paper: any) => void;
  'paper:updated': (paper: any) => void;
  'paper:deleted': (paperId: string) => void;

  // Experiment events
  'experiment:started': (experiment: any) => void;
  'experiment:progress': (data: { experimentId: string; progress: number; status: string }) => void;
  'experiment:completed': (experiment: any) => void;
  'experiment:failed': (data: { experimentId: string; error: string }) => void;

  // Prediction events
  'prediction:started': (prediction: any) => void;
  'prediction:progress': (data: { predictionId: string; progress: number; stage: string }) => void;
  'prediction:completed': (prediction: any) => void;

  // Research agent events
  'agent:status': (data: { agentId: string; status: string; message: string }) => void;
  'agent:result': (data: { agentId: string; result: any }) => void;

  // System events
  'system:notification': (data: {
    type: string;
    message: string;
    level: 'info' | 'warn' | 'error';
  }) => void;
  'system:maintenance': (data: { scheduled: boolean; message: string }) => void;
}

export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private clients = new Map<string, Socket>();
  private rooms = new Map<string, Set<string>>();

  initialize(server: HTTPServer) {
    if (this.io) {
      logger.warn('WebSocket server already initialized');
      return;
    }

    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
    logger.info('WebSocket server initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const clientId = socket.id;
      this.clients.set(clientId, socket);

      logger.info('WebSocket client connected', { clientId });

      // Handle authentication
      socket.on('authenticate', async (token: string) => {
        try {
          // Verify token (implement your auth logic)
          const userId = await this.verifyToken(token);
          if (userId) {
            socket.data.userId = userId;
            socket.join(`user:${userId}`);
            socket.emit('authenticated', { userId });
          } else {
            socket.emit('authentication:failed', { error: 'Invalid token' });
          }
        } catch (error) {
          logger.error('WebSocket authentication error', error as Error);
          socket.emit('authentication:failed', { error: 'Authentication error' });
        }
      });

      // Handle room subscriptions
      socket.on('subscribe', (room: string) => {
        socket.join(room);

        if (!this.rooms.has(room)) {
          this.rooms.set(room, new Set());
        }
        this.rooms.get(room)!.add(clientId);

        logger.debug('Client subscribed to room', { clientId, room });
      });

      socket.on('unsubscribe', (room: string) => {
        socket.leave(room);

        if (this.rooms.has(room)) {
          this.rooms.get(room)!.delete(clientId);
          if (this.rooms.get(room)!.size === 0) {
            this.rooms.delete(room);
          }
        }

        logger.debug('Client unsubscribed from room', { clientId, room });
      });

      // Handle custom events
      socket.on('request:prediction', async (data: any) => {
        try {
          // Emit prediction started event
          this.emitToUser(socket.data.userId, 'prediction:started', {
            id: data.id,
            configuration: data.configuration,
          });

          // Process prediction (this would be handled by your prediction service)
          // For now, we'll simulate progress updates
          this.simulatePredictionProgress(data.id, socket.data.userId);
        } catch (error) {
          socket.emit('prediction:error', { error: (error as Error).message });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.clients.delete(clientId);

        // Clean up room memberships
        this.rooms.forEach((members, room) => {
          if (members.has(clientId)) {
            members.delete(clientId);
            if (members.size === 0) {
              this.rooms.delete(room);
            }
          }
        });

        logger.info('WebSocket client disconnected', { clientId });
      });

      // Error handling
      socket.on('error', (error) => {
        logger.error('WebSocket error', error);
      });
    });
  }

  private async verifyToken(token: string): Promise<string | null> {
    // Implement your token verification logic
    // This should integrate with your auth system
    try {
      // Example: verify JWT token
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // return decoded.userId;

      // For now, return a mock user ID
      return 'mock-user-id';
    } catch (error) {
      return null;
    }
  }

  private simulatePredictionProgress(predictionId: string, userId: string) {
    let progress = 0;
    const stages = ['initializing', 'loading-model', 'processing', 'optimizing', 'finalizing'];
    let stageIndex = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 20;

      if (progress >= 100) {
        progress = 100;
        this.emitToUser(userId, 'prediction:completed', {
          id: predictionId,
          result: {
            powerOutput: 850 + Math.random() * 150,
            efficiency: 75 + Math.random() * 20,
            confidence: 0.85 + Math.random() * 0.1,
          },
        });
        clearInterval(interval);
      } else {
        if (progress > (stageIndex + 1) * 20) {
          stageIndex++;
        }

        this.emitToUser(userId, 'prediction:progress', {
          predictionId,
          progress: Math.min(progress, 99),
          stage: stages[stageIndex],
        });
      }
    }, 1000);
  }

  // Emit to specific user
  emitToUser<K extends keyof WebSocketEvents>(
    userId: string,
    event: K,
    data: Parameters<WebSocketEvents[K]>[0]
  ) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Emit to specific room
  emitToRoom<K extends keyof WebSocketEvents>(
    room: string,
    event: K,
    data: Parameters<WebSocketEvents[K]>[0]
  ) {
    if (!this.io) return;
    this.io.to(room).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast<K extends keyof WebSocketEvents>(event: K, data: Parameters<WebSocketEvents[K]>[0]) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Get connection statistics
  getStats() {
    return {
      totalClients: this.clients.size,
      totalRooms: this.rooms.size,
      roomStats: Array.from(this.rooms.entries()).map(([room, members]) => ({
        room,
        memberCount: members.size,
      })),
    };
  }

  // Graceful shutdown
  async shutdown() {
    if (!this.io) return;

    logger.info('Shutting down WebSocket server');

    // Notify all clients
    this.broadcast('system:notification', {
      type: 'shutdown',
      message: 'Server is shutting down',
      level: 'warn',
    });

    // Close all connections
    this.io.close();
    this.clients.clear();
    this.rooms.clear();
    this.io = null;
  }
}

// Export singleton instance
export const wsServer = new WebSocketServer();
