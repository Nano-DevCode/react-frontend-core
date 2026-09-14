import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchNotificationsAction,
  fetchUnreadCountAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from '../actions/notification.actions';
import type {
  AppNotification,
  NotificationQueryParams,
} from '@/types/notification.types';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'] as const;

export const useNotificationsQuery = (params?: NotificationQueryParams) => {
  return useQuery<AppNotification[]>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => fetchNotificationsAction(params),
    staleTime: 1000 * 30, // 30 segundos
  });
};

export const useUnreadNotificationsCountQuery = () => {
  return useQuery<number>({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => fetchUnreadCountAction(),
    staleTime: 1000 * 20, // 20 segundos
    refetchInterval: 1000 * 45, // Respaldo ante desconexión de sockets
  });
};

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsReadAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    onError: (err) => {
      console.error('[useMarkAsReadMutation] Error al marcar como leída:', err);
    },
  });
};

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsReadAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success('Todas las notificaciones han sido marcadas como leídas.');
    },
    onError: (err) => {
      console.error('[useMarkAllAsReadMutation] Error al marcar todas como leídas:', err);
    },
  });
};

