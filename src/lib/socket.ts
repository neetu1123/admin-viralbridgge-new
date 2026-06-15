'use client';

import { io, type Socket } from 'socket.io-client';
import { getSocketUrl } from './api';

let socket: Socket | null = null;

export function getNotificationSocket(): Socket | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!socket || !socket.connected) {
    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  return socket;
}

export function disconnectNotificationSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
