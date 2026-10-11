export const NOTIFICATIONS_ENDPOINTS = {
  BASE: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  BY_ID: (id: string) => `/notifications/${encodeURIComponent(id)}`,
  MARK_AS_READ: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
  MARK_ALL_READ: '/notifications/read-all',
} as const;

