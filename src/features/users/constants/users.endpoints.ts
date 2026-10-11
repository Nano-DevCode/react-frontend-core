export const USERS_ENDPOINTS = {
  BASE: '/users',
  BY_ID: (id: string) => `/users/${id}`,
  STATUS: (id: string) => `/users/${id}/status`,
  ROLES: (id: string) => `/users/${id}/roles`,
  RESTORE: (id: string) => `/users/${id}/restore`,
} as const;

