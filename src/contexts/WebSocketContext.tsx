import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '../api';
import { useAuth } from './AuthContext';
import type { WebSocketMessage } from '../types';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (destination: string, callback: (message: WebSocketMessage) => void) => () => void;
  sendMessage: (destination: string, body: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (client) {
        client.deactivate();
        setClient(null);
        setIsConnected(false);
      }
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/api/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('STOMP:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    stompClient.onDisconnect = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [isAuthenticated, user]);

  const subscribe = useCallback(
    (destination: string, callback: (message: WebSocketMessage) => void) => {
      if (!client || !isConnected) {
        return () => {};
      }

      const subscription = client.subscribe(destination, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body) as WebSocketMessage;
          callback(parsed);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    },
    [client, isConnected]
  );

  const sendMessage = useCallback(
    (destination: string, body: unknown) => {
      if (!client || !isConnected) {
        console.warn('WebSocket not connected');
        return;
      }

      client.publish({
        destination,
        body: JSON.stringify(body),
      });
    },
    [client, isConnected]
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
