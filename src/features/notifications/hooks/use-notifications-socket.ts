import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import { openOrDownloadPdf } from '@/features/documents/utils/file-utils';
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
} from './use-notifications';
import type { AppNotification } from '@/types/notification.types';

const getSocketBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    try {
      const parsed = new URL(envUrl);
      return parsed.origin;
    } catch {
      // Fallback
    }
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
};

export const useNotificationsSocket = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Si no está autenticado, no abrir conexión WebSocket
    if (!isAuthenticated) {
      return;
    }

    const baseUrl = getSocketBaseUrl();
    const socketEndpoint = `${baseUrl}/realtime/notifications`;

    const socketInstance: Socket = io(socketEndpoint, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token: accessToken || undefined,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2500,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setSocket(null);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('[NotificationsSocket] Error de conexión WebSocket:', error.message);
      setIsConnected(false);
    });

    // Escucha del evento 'notification:new'
    socketInstance.on('notification:new', (payload: AppNotification | { notification: AppNotification }) => {
      const notification: AppNotification =
        'notification' in payload && payload.notification
          ? payload.notification
          : (payload as AppNotification);

      // 1. Invalidar caché en TanStack Query para actualización instantánea
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      // 2. Preparar acción interactiva para PDFs o archivos adjuntos
      const fileKey = notification.data?.fileKey;
      const filename = notification.data?.filename;

      const toastAction = fileKey
        ? {
            label: 'Descargar PDF',
            onClick: () => {
              void openOrDownloadPdf(fileKey, {
                action: 'download',
                filename,
              });
            },
          }
        : undefined;

      const toastOptions = {
        id: `notif-${notification.id || Date.now()}`,
        description: notification.message,
        action: toastAction,
        duration: 6000,
      };

      // 3. Renderizar Toast interactivo según el tipo de notificación
      switch (notification.type) {
        case 'pdf_generated':
        case 'file_ready':
        case 'success':
          toast.success(notification.title || 'Nuevo documento disponible', toastOptions);
          break;
        case 'warning':
          toast.warning(notification.title || 'Alerta del sistema', toastOptions);
          break;
        case 'error':
          toast.error(notification.title || 'Error en proceso', toastOptions);
          break;
        default:
          toast.info(notification.title || 'Nueva notificación', toastOptions);
          break;
      }
    });

    return () => {
      socketInstance.disconnect();
      setIsConnected(false);
      setSocket(null);
    };
  }, [isAuthenticated, accessToken, queryClient]);

  return {
    isConnected,
    socket,
  };
};

