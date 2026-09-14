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
import type { AppNotification, NotificationData } from '@/types/notification.types';

/**
 * Resuelve dinámicamente el endpoint del WebSocket apuntando explícitamente
 * al namespace '/realtime/notifications' configurado en NestJS.
 */
const getSocketEndpoint = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    try {
      const parsed = new URL(envUrl);
      return `${parsed.origin}/realtime/notifications`;
    } catch {
      // Fallback si la URL es inválida
    }
  }

  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port !== '3000' &&
    window.location.port !== '80' &&
    window.location.port !== '443' &&
    window.location.port !== ''
  ) {
    // Entorno de desarrollo local con Vite (puertos 5173, 5174, etc.)
    return 'http://localhost:3000/realtime/notifications';
  }

  // En producción (detrás de NGINX Reverse Proxy con proxy_pass) o ruta relativa
  return '/realtime/notifications';
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

    const socketEndpoint = getSocketEndpoint();
    console.log(`[NotificationsSocket] Iniciando conexión WebSocket hacia: ${socketEndpoint}`);

    const socketInstance: Socket = io(socketEndpoint, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: {
        token: accessToken || undefined,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    // Handshake: Evento connect
    socketInstance.on('connect', () => {
      console.log(
        `[NotificationsSocket] Conectado exitosamente al namespace "/realtime/notifications" (Socket ID: ${socketInstance.id})`,
      );
      setIsConnected(true);
      setSocket(socketInstance);
    });

    // Handshake: Evento disconnect
    socketInstance.on('disconnect', (reason) => {
      console.log(`[NotificationsSocket] Desconectado del WebSocket. Causa: ${reason}`);
      setIsConnected(false);
      setSocket(null);
    });

    // Handshake: Evento connect_error
    socketInstance.on('connect_error', (error) => {
      console.warn(
        `[NotificationsSocket] Error de conexión WebSocket hacia "${socketEndpoint}":`,
        error.message,
      );
      setIsConnected(false);
    });

    // Manejador unificado de eventos de notificación en tiempo real
    const handleNotification = (
      payload: AppNotification | { notification: AppNotification } | Record<string, unknown>,
    ) => {
      console.log('[NotificationsSocket] Notificación entrante recibida:', payload);

      const rawNotif =
        payload && typeof payload === 'object' && 'notification' in payload && payload.notification
          ? (payload.notification as Record<string, unknown>)
          : (payload as Record<string, unknown>);

      const notification: AppNotification = {
        id: String(rawNotif.id || Date.now()),
        title: String(rawNotif.title || 'Nueva notificación'),
        message: String(rawNotif.message || rawNotif.body || ''),
        type: ((rawNotif.type as string) || 'info').toLowerCase(),
        read: Boolean(rawNotif.read ?? rawNotif.isRead ?? false),
        createdAt: String(rawNotif.createdAt || new Date().toISOString()),
        data: (rawNotif.data as NotificationData) || undefined,
        metadata: (rawNotif.metadata as Record<string, unknown>) || undefined,
      };

      // 1. Invalidar caché en TanStack Query para refresco inmediato en la UI
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      // 2. Preparar acción interactiva para descargas de PDF o archivos adjuntos
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

      // 3. Renderizar Toast interactivo según la severidad/tipo
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
    };

    // Escucha bidireccional tanto para 'notification' (emitido por backend) como 'notification:new'
    socketInstance.on('notification', handleNotification);
    socketInstance.on('notification:new', handleNotification);

    return () => {
      console.log('[NotificationsSocket] Limpiando listeners y desconectando socket...');
      socketInstance.off('notification', handleNotification);
      socketInstance.off('notification:new', handleNotification);
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
