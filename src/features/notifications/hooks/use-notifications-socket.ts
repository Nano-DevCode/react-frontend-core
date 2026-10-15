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
import type { AppNotification, NotificationData } from '../types/notification.types';
import type { PublicFeatureFlags } from '@/features/feature-flags/actions/feature-flags.actions';
import { FeatureFlagRecord } from '@/features/feature-flags/types/feature-flags.types';

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
// GESTOR SINGLETON PERSISTENTE DE WEBSOCKET (SOCKET.IO)
// Evita conexiones simultáneas y previene la cancelación en vuelo de React StrictMode.
// =============================================================================
let sharedSocket: Socket | null = null;
let currentToken: string | null = null;
let subscribersCount = 0;
let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

export const useNotificationsSocket = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(() => sharedSocket);
  const [isConnected, setIsConnected] = useState<boolean>(() => Boolean(sharedSocket?.connected));

  useEffect(() => {
    // Si el usuario no está autenticado, desconectar inmediatamente cualquier socket residual
    if (!isAuthenticated) {
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }
      if (sharedSocket) {
        console.log('[NotificationsSocket] Usuario no autenticado. Desconectando socket.');
        sharedSocket.removeAllListeners();
        sharedSocket.disconnect();
        sharedSocket = null;
        currentToken = null;
        subscribersCount = 0;
      }
      return;
    }

    // Cancelar cualquier temporizador de desconexión pendiente (producido en React StrictMode)
    if (disconnectTimer) {
      clearTimeout(disconnectTimer);
      disconnectTimer = null;
    }

    subscribersCount++;

    const socketEndpoint = getSocketEndpoint();

    // Si el token cambió (renovación de sesión o cambio de usuario), cerrar y recrear
    if (sharedSocket && currentToken !== accessToken) {
      console.log('[NotificationsSocket] Token actualizado. Desconectando conexión anterior.');
      sharedSocket.removeAllListeners();
      sharedSocket.disconnect();
      sharedSocket = null;
      currentToken = null;
    }

    // Inicializar instancia Singleton si no existe actualmente
    if (!sharedSocket) {
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
      if (reason === 'io server disconnect') {
        // Desconexión iniciada por el servidor: requiere reconexión manual
        if (sharedSocket === currentSocket) {
          sharedSocket = null;
          currentToken = null;
        }
      }
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

    // Manejador reactivo de sincronización en tiempo real de Feature Flags
    const handleFeatureFlagUpdated = (payload: {
      key: string;
      enabled: boolean;
      roles?: string[];
      rollout?: number;
    }) => {
      console.log('[Socket] Evento feature-flag:updated recibido:', payload);

      // 1. Actualizar caché de feature-flags en TanStack Query inmediatamente
      queryClient.setQueryData<FeatureFlagRecord[]>(['feature-flags'], (old = []) => {
        const index = old.findIndex((f) => f.key === payload.key);
        if (index >= 0) {
          const updated = [...old];
          updated[index] = {
            ...updated[index],
            isEnabled: payload.enabled,
            rules: {
              ...updated[index].rules,
              percentage: payload.rollout ?? (payload.enabled ? 100 : 0),
              allowedRoles: payload.roles ?? updated[index].rules?.allowedRoles,
            },
            updatedAt: new Date().toISOString(),
          };
          return updated;
        }

        return [
          ...old,
          {
            id: `ff-${payload.key}`,
            key: payload.key,
            description: null,
            isEnabled: payload.enabled,
            rules: {
              percentage: payload.rollout ?? (payload.enabled ? 100 : 0),
              allowedRoles: payload.roles ?? [],
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      });

      // 2. Sincronizar public-feature-flags si corresponde
      queryClient.setQueryData<PublicFeatureFlags>(['public-feature-flags'], (old: PublicFeatureFlags | undefined) => {
        if (!old) return old;
        const normalized = payload.key.toUpperCase();
        if (normalized === 'DISCORD_BOT_ENABLED' || normalized === 'DISCORD_BOT') {
          return { ...old, discord_bot: payload.enabled };
        }
        if (normalized === 'OAUTH_SOCIAL_LOGIN') {
          return { ...old, oauth_social_login: payload.enabled };
        }
        if (normalized === 'OAUTH_GOOGLE') {
          return { ...old, oauth_google: payload.enabled };
        }
        if (normalized === 'OAUTH_FACEBOOK') {
          return { ...old, oauth_facebook: payload.enabled };
        }
        return old;
      });

      // 3. Invalidar consultas relacionadas
      void queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      void queryClient.invalidateQueries({ queryKey: ['public-feature-flags'] });
      void queryClient.invalidateQueries({ queryKey: ['discord-bot-status'] });
    };

    currentSocket.on('connect', onConnect);
    currentSocket.on('disconnect', onDisconnect);
    currentSocket.on('connect_error', onConnectError);
    currentSocket.on('notification', handleNotification);
    currentSocket.on('notification:new', handleNotification);
    currentSocket.on('feature-flag:updated', handleFeatureFlagUpdated);

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
      subscribersCount = Math.max(0, subscribersCount - 1);
      currentSocket.off('connect', onConnect);
      currentSocket.off('disconnect', onDisconnect);
      currentSocket.off('connect_error', onConnectError);
      currentSocket.off('notification', handleNotification);
      currentSocket.off('notification:new', handleNotification);
      currentSocket.off('feature-flag:updated', handleFeatureFlagUpdated);

      // Si no quedan suscriptores activos, programar desconexión con una pequeña ventana de gracia (debounce)
      // para tolerar el remonte inmediato de React StrictMode sin cancelar el handshake TCP en vuelo
      // ni dejar conexiones huérfanas en el backend.
      if (subscribersCount === 0) {
        disconnectTimer = setTimeout(() => {
          if (subscribersCount === 0 && sharedSocket) {
            console.log('[NotificationsSocket] Sin suscriptores activos. Desconectando socket.');
            sharedSocket.disconnect();
            sharedSocket = null;
            currentToken = null;
          }
        }, 1000);
      }
    };
  }, [isAuthenticated, accessToken, queryClient]);

  return {
    isConnected,
    socket,
  };
};
