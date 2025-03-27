import { RealtimeChannel } from '@supabase/supabase-js';
import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  // Subscribe to real-time changes
  const messagesChannel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages'
      },
      (payload) => {
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({
              type: 'message',
              payload
            }));
          }
        });
      }
    )
    .subscribe();

  const wellnessChannel = supabase
    .channel('wellness')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wellness_metrics'
      },
      (payload) => {
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify({
              type: 'wellness',
              payload
            }));
          }
        });
      }
    )
    .subscribe();

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle incoming messages if needed
        console.log('Received:', data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return wss;
}; 