import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.VITE_API_BASE || 'http://localhost:3001', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('itemUpdated', (data) => {
        console.log('Item updated:', data);
        // Trigger a refresh of items
        window.dispatchEvent(new CustomEvent('itemUpdated', { detail: data }));
      });
    }

    return () => {
      // Don't disconnect on unmount to keep connection alive
    };
  }, []);

  return { socket, isConnected };
}

export function emitItemUpdate(data: any) {
  if (socket && socket.connected) {
    socket.emit('itemUpdated', data);
  }
}
