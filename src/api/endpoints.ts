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
  DISCORD_BOT: {
    STATUS: '/discord/status',
    GUILDS: '/discord/guilds',
    QUEUE: (guildId: string) => `/discord/queue/${guildId}`,
    PLAYBACK: (guildId: string) => `/discord/playback/${guildId}`,
    REMOVE_TRACK: (guildId: string, index: number) => `/discord/queue/${guildId}/tracks/${index}`,
    CLEAR_QUEUE: (guildId: string) => `/discord/queue/${guildId}`,
    SEND_MESSAGE: '/discord/messages/send',
    UPDATE_CONFIG: (guildId: string) => `/discord/guilds/${guildId}/config`,
  },
} as const;

