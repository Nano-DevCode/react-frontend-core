import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { AppNotification, MarkReadResponse, NotificationListResponse, NotificationQueryParams, UnreadCountResponse } from '../types/notification.types';

export const fetchNotificationsAction = async (
  params?: NotificationQueryParams
): Promise<AppNotification[]> => {
  const response = await apiClient.get<AppNotification[] | NotificationListResponse>(
    API_ENDPOINTS.NOTIFICATIONS.BASE,
    {
      params,
    }
  );

  // Soporta tanto arreglo plano como objeto con clave `notifications`
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray((response.data as NotificationListResponse).notifications)) {
    return (response.data as NotificationListResponse).notifications;
  }

  return [];
};

export const fetchUnreadCountAction = async (): Promise<number> => {
  const response = await apiClient.get<UnreadCountResponse | number>(
    API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
  );

  if (typeof response.data === 'number') {
    return response.data;
  }
  if (typeof response.data?.count === 'number') {
    return response.data.count;
  }

  return 0;
};

export const markNotificationAsReadAction = async (
  id: string
): Promise<AppNotification | null> => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id);
  try {
    const response = await apiClient.patch<AppNotification>(endpoint);
    return response.data;
  } catch {
    // Si el backend prefiere POST en lugar de PATCH
    const fallbackResponse = await apiClient.post<AppNotification>(endpoint);
    return fallbackResponse.data;
  }
};

export const markAllNotificationsAsReadAction = async (): Promise<MarkReadResponse> => {
  const endpoint = API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ;
  try {
    const response = await apiClient.patch<MarkReadResponse>(endpoint);
    return response.data;
  } catch {
    const fallbackResponse = await apiClient.post<MarkReadResponse>(endpoint);
    return fallbackResponse.data;
  }
};

