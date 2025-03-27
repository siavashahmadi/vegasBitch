import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: 'message' | 'wellness' | 'poll' | 'itinerary';
  payload: any;
}

type MessageHandler = (message: WebSocketMessage) => void;

export const useWebSocket = (onMessage: MessageHandler) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket Disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          ws.current = new WebSocket('ws://localhost:3001');
        }
      }, 5000);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [onMessage]);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  return { sendMessage };
}; 