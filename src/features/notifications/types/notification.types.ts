// ============================================================================
// CONTRATOS DE NOTIFICACIONES (/notifications)
// ============================================================================

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'pdf_generated'
  | 'file_ready'
  | string;

export interface NotificationData {
  fileKey?: string;
  filename?: string;
  url?: string;
  size?: number;
  actionUrl?: string;
  [key: string]: unknown;
}

/**
 * Atributos universales y compartidos de una Notificación
 */
export interface NotificationBase {
  title: string;
  message: string;
  type: NotificationType;
  data?: NotificationData;
  metadata?: Record<string, unknown>;
}

/**
 * Representación de una notificación en listas y dropdowns (NotificationListItemResponse)
 */
export interface NotificationListItemResponse extends NotificationBase {
  id: string;
  userId?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Representación detallada de una notificación por su ID (NotificationIdResponse)
 */
export type NotificationIdResponse = NotificationListItemResponse;

/**
 * Sobre de respuesta de listado de notificaciones (NotificationListResponse)
 */
export interface NotificationListResponse {
  notifications: NotificationListItemResponse[];
  total: number;
  unreadCount?: number;
}

/**
 * Parámetros de consulta para filtrado de notificaciones
 */
export interface NotificationQueryParams {
  unreadOnly?: boolean;
  limit?: number;
  page?: number;
}

/**
 * DTO para la creación manual de una notificación (CreateNotificationDto)
 */
export interface CreateNotificationDto extends NotificationBase {
  userId?: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadResponse {
  success: boolean;
  count?: number;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type AppNotification = NotificationListItemResponse;
export type NotificationDetailResponse = NotificationIdResponse;
