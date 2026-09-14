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

// =============================================================================
// GESTOR SINGLETON DE WEBSOCKET (SOCKET.IO)
// Control de referencias estricto para evitar duplicación de conexiones simultáneas.
// =============================================================================
let sharedSocket: Socket | null = null;
let currentToken: string | null = null;
let listenersCount = 0;

export const useNotificationsSocket = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(() => sharedSocket);
  const [isConnected, setIsConnected] = useState<boolean>(() => Boolean(sharedSocket?.connected));

  useEffect(() => {
    // Si el usuario no está autenticado, desconectar inmediatamente cualquier socket residual
    if (!isAuthenticated) {
      if (sharedSocket) {
        console.log('[NotificationsSocket] Usuario desautenticado. Desconectando socket.');
        sharedSocket.removeAllListeners();
        sharedSocket.disconnect();
        sharedSocket = null;
        currentToken = null;
        listenersCount = 0;
      }
      return;
    }

    listenersCount++;

    const socketEndpoint = getSocketEndpoint();

    // Si ya existe un socket pero cambió el token de autenticación, forzar reconexión limpia
    if (sharedSocket && currentToken !== accessToken) {
      console.log('[NotificationsSocket] Token actualizado. Desconectando conexión anterior.');
      sharedSocket.removeAllListeners();
      sharedSocket.disconnect();
      sharedSocket = null;
      currentToken = null;
    }

    // Inicializar instancia Singleton si no existe o se encuentra desconectada
    if (!sharedSocket || sharedSocket.disconnected) {
      console.log(`[NotificationsSocket] Iniciando conexión Singleton hacia: ${socketEndpoint}`);
      currentToken = accessToken || null;

      sharedSocket = io(socketEndpoint, {
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
    }

    const currentSocket = sharedSocket;

    // Handshake: Evento connect
    const onConnect = () => {
      console.log(
        `[NotificationsSocket] Conectado exitosamente al namespace "/realtime/notifications" (Socket ID: ${currentSocket.id})`,
      );
      setIsConnected(true);
      setSocket(currentSocket);
    };

    // Handshake: Evento disconnect
    const onDisconnect = (reason: string) => {
      console.log(`[NotificationsSocket] Desconectado del WebSocket. Causa: ${reason}`);
      setIsConnected(false);
      setSocket(null);
    };

    // Handshake: Evento connect_error
    const onConnectError = (error: Error) => {
      console.warn(
        `[NotificationsSocket] Error de conexión WebSocket hacia "${socketEndpoint}":`,
        error.message,
      );
      setIsConnected(false);
    };

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

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);
    currentSocket.on('connect_error', onConnectError);
    currentSocket.on('notification', handleNotification);
    currentSocket.on('notification:new', handleNotification);

    if (currentSocket.connected) {
      queueMicrotask(() => {
        setIsConnected(true);
        setSocket(currentSocket);
      });
    } else {
      queueMicrotask(() => {
        setSocket(currentSocket);
      });
    }

    return () => {
      listenersCount = Math.max(0, listenersCount - 1);
      currentSocket.off('connect', onConnect);
      currentSocket.off('disconnect', onDisconnect);
      currentSocket.off('connect_error', onConnectError);
      currentSocket.off('notification', handleNotification);
      currentSocket.off('notification:new', handleNotification);

      // Si no quedan suscriptores activos (desmontaje del componente o StrictMode),
      // desconectar el socket inmediatamente para no dejarlo huérfano en el backend
      if (listenersCount === 0) {
        console.log('[NotificationsSocket] Sin suscriptores activos. Desconectando socket residual.');
        currentSocket.disconnect();
        if (sharedSocket === currentSocket) {
          sharedSocket = null;
          currentToken = null;
        }
      }
    };
  }, [isAuthenticated, accessToken, queryClient]);

  return {
    isConnected,
    socket,
  };
};
