export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ADMIN_DASHBOARD: '/auth/admin-dashboard',
    USERS_EXPORT: '/auth/users-export',
    CRITICAL_ACTION: '/auth/critical-action',
  },
  TWO_FACTOR: {
    GENERATE: '/auth/2fa/generate',
    TURN_ON: '/auth/2fa/turn-on',
    TURN_OFF: '/auth/2fa/turn-off',
    AUTHENTICATE: '/auth/2fa/authenticate',
    STATUS: '/auth/2fa/status',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    STATUS: (id: string) => `/users/${id}/status`,
    ROLES: (id: string) => `/users/${id}/roles`,
  },
  FILES: {
    UPLOAD: '/files/upload',
    UPLOAD_MULTIPLE: '/files/upload-multiple',
    PUBLIC: (key: string) => `/files/public/${encodeURIComponent(key)}`,
    VIEW: (key: string) => `/files/view/${encodeURIComponent(key)}`,
    URL: (key: string) => `/files/${encodeURIComponent(key)}/url`,
    DELETE: (key: string) => `/files/${encodeURIComponent(key)}`,
  },
  HEALTH: '/health',
  FEATURE_FLAGS: {
    BASE: '/feature-flags',
    PUBLIC: '/feature-flags/public',
    BY_KEY: (key: string) => `/feature-flags/${key}`,
    BETA_FEATURE: '/beta-feature',
  },
  AUDIT: {
    BASE: '/audit',
  },
  PDF: {
    GENERATE: '/pdf/generate',
    PREVIEW_SYNC: '/pdf/preview-sync',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    BY_ID: (id: string) => `/notifications/${encodeURIComponent(id)}`,
    MARK_AS_READ: (id: string) => `/notifications/${encodeURIComponent(id)}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  LOGS: {
    BASE: '/logs',
    CLIENT: '/logs/client',
    STATS: '/logs/stats',
  },
  SYSTEM: {
    TELEMETRY: '/system/telemetry',
  },
} as const;

