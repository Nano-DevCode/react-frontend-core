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

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  data?: NotificationData;
  metadata?: Record<string, unknown>;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  total: number;
  unreadCount?: number;
}

export interface NotificationQueryParams {
  unreadOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadResponse {
  success: boolean;
  count?: number;
}

