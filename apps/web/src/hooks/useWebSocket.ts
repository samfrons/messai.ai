'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { WebSocketEvents } from '../lib/websocket/server';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  token?: string;
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  authenticated: boolean;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
    token,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    authenticated: false,
    error: null,
  });

  const eventHandlers = useRef<Map<string, Set<Function>>>(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      auth: token ? { token } : undefined,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      setState((prev) => ({ ...prev, connected: true, connecting: false, error: null }));

      // Authenticate if token is provided
      if (token) {
        socket.emit('authenticate', token);
      }
    });

    socket.on('disconnect', () => {
      setState((prev) => ({ ...prev, connected: false, authenticated: false }));
    });

    socket.on('connect_error', (error) => {
      setState((prev) => ({ ...prev, connecting: false, error }));
    });

    socket.on('authenticated', ({ userId }) => {
      setState((prev) => ({ ...prev, authenticated: true }));
    });

    socket.on('authentication:failed', ({ error }) => {
      setState((prev) => ({ ...prev, authenticated: false, error: new Error(error) }));
    });

    // Set up event forwarding
    const setupEventForwarding = () => {
      eventHandlers.current.forEach((handlers, event) => {
        socket.off(event); // Remove existing listeners
        socket.on(event, (...args) => {
          handlers.forEach((handler) => handler(...args));
        });
      });
    };

    setupEventForwarding();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, reconnection, reconnectionAttempts, reconnectionDelay, token]);

  // Subscribe to events
  const on = useCallback(
    <K extends keyof WebSocketEvents>(event: K, handler: WebSocketEvents[K]) => {
      if (!eventHandlers.current.has(event)) {
        eventHandlers.current.set(event, new Set());
      }

      eventHandlers.current.get(event)!.add(handler as Function);

      // If socket is already connected, set up the listener immediately
      if (socketRef.current?.connected) {
        socketRef.current.on(event, handler as any);
      }

      // Return unsubscribe function
      return () => {
        const handlers = eventHandlers.current.get(event);
        if (handlers) {
          handlers.delete(handler as Function);
          if (handlers.size === 0) {
            eventHandlers.current.delete(event);
          }
        }

        if (socketRef.current) {
          socketRef.current.off(event, handler as any);
        }
      };
    },
    []
  );

  // Emit events
  const emit = useCallback(
    <K extends keyof WebSocketEvents>(event: K, data?: Parameters<WebSocketEvents[K]>[0]) => {
      if (!socketRef.current?.connected) {
        console.warn('Cannot emit event: socket not connected');
        return;
      }

      socketRef.current.emit(event, data);
    },
    []
  );

  // Subscribe to room
  const subscribe = useCallback((room: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot subscribe: socket not connected');
      return;
    }

    socketRef.current.emit('subscribe', room);
  }, []);

  // Unsubscribe from room
  const unsubscribe = useCallback((room: string) => {
    if (!socketRef.current?.connected) {
      console.warn('Cannot unsubscribe: socket not connected');
      return;
    }

    socketRef.current.emit('unsubscribe', room);
  }, []);

  // Manual connect/disconnect
  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      setState((prev) => ({ ...prev, connecting: true }));
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.disconnect();
    }
  }, []);

  return {
    ...state,
    socket: socketRef.current,
    on,
    emit,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}

// Context provider for global WebSocket connection
import React, { createContext, useContext } from 'react';

interface WebSocketContextValue extends ReturnType<typeof useWebSocket> {}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({
  children,
  token,
  ...options
}: {
  children: React.ReactNode;
  token?: string;
} & UseWebSocketOptions) {
  const webSocket = useWebSocket({ ...options, token });

  return <WebSocketContext.Provider value={webSocket}>{children}</WebSocketContext.Provider>;
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
}
