import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const connectSocket = (userId: string): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('join:user', userId);
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const joinRoom = (roomId: string): void => {
  socket?.emit('join:room', roomId);
};

export const leaveRoom = (roomId: string): void => {
  socket?.emit('leave:room', roomId);
};

export default getSocket;
