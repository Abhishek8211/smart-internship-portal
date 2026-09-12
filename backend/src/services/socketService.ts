import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;
const userSockets = new Map<string, string[]>(); // Map of userId -> socketIds[]

const JWT_SECRET = process.env.JWT_SECRET || 'sip_jwt_secret_token_2026_key';

export const initSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.use((socket: Socket, next) => {
    // Auth middleware for sockets
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication token is required.'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      socket.data = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (err) {
      return next(new Error('Invalid socket connection token.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId } = socket.data;
    console.log(`🔌 Socket client connected: ${socket.id} (User: ${userId})`);

    // Track active connection
    const current = userSockets.get(userId) || [];
    current.push(socket.id);
    userSockets.set(userId, current);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket client disconnected: ${socket.id}`);
      const list = userSockets.get(userId) || [];
      const updated = list.filter(id => id !== socket.id);
      if (updated.length > 0) {
        userSockets.set(userId, updated);
      } else {
        userSockets.delete(userId);
      }
    });
  });

  console.log('⚡ Real-time Socket.io server layer initialized.');
  return io;
};

// Dispatch notification alert to active user sockets
export const emitNotification = (userId: string, notification: any) => {
  if (!io) return;
  const socketIds = userSockets.get(userId);
  if (socketIds && socketIds.length > 0) {
    socketIds.forEach(id => {
      io!.to(id).emit('notification', notification);
    });
    console.log(`📡 Emitted real-time notification to user: ${userId}`);
  }
};
export default { initSocketServer, emitNotification };
