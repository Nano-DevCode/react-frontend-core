export const ROLES_ENDPOINTS = {
  BASE: '/roles',
  PERMISSIONS: '/roles/permissions',
  BY_ID: (id: string) => `/roles/${id}`,
} as const;

