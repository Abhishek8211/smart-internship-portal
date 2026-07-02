'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface SocketContextProps {
  socket: Socket | null;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  toasts: [],
  removeToast: () => {}
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!accessToken || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to WebSocket server (extracting host from API endpoint)
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const socketInstance = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Real-time alerts socket connected successfully.');
    });

    socketInstance.on('notification', (notif: any) => {
      console.log('📡 Real-time notification received:', notif);
      
      const newToast: Toast = {
        id: notif._id || Math.random().toString(),
        title: notif.title || 'Platform Notification',
        message: notif.message || '',
        type: notif.type || 'info'
      };

      // Append toast
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after 6 seconds
      setTimeout(() => {
        removeToast(newToast.id);
      }, 6000);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error, retrying:', err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user]);

  return (
    <SocketContext.Provider value={{ socket, toasts, removeToast }}>
      {children}
      
      {/* Toast Alert Portal View */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="p-4 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md bg-slate-950/80 text-white flex items-start space-x-3"
            >
              {/* Type Icons */}
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {toast.type === 'alert' && <XCircle className="w-5 h-5 text-rose-400" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              {/* Message text */}
              <div className="flex-grow space-y-1">
                <h5 className="font-extrabold text-xs tracking-wider flex items-center space-x-1">
                  <span>{toast.title}</span>
                </h5>
                <p className="text-[11px] leading-relaxed text-slate-300 font-semibold">{toast.message}</p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
