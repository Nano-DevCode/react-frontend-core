import { AUTH_ENDPOINTS } from '@/features/auth/constants/auth.endpoints';
import { TWO_FACTOR_ENDPOINTS } from '@/features/two-factor/constants/two-factor.endpoints';
import { USERS_ENDPOINTS } from '@/features/users/constants/users.endpoints';
import { FILES_ENDPOINTS } from '@/features/files/constants/files.endpoints';
import { HEALTH_ENDPOINTS } from '@/features/health/constants/health.endpoints';
import { FEATURE_FLAGS_ENDPOINTS } from '@/features/feature-flags/constants/feature-flags.endpoints';
import { AUDIT_ENDPOINTS } from '@/features/audit/constants/audit.endpoints';
import { PDF_ENDPOINTS } from '@/features/documents/constants/pdf.endpoints';
import { NOTIFICATIONS_ENDPOINTS } from '@/features/notifications/constants/notifications.endpoints';
import { SYSTEM_LOGS_ENDPOINTS } from '@/features/system-logs/constants/system-logs.endpoints';
import { DISCORD_BOT_ENDPOINTS } from '@/features/discord-bot/constants/discord-bot.endpoints';
import { ROLES_ENDPOINTS } from '@/features/roles/constants/roles.endpoints';

/**
 * Registro centralizado que compone los contratos de URL de cada módulo funcional.
 * Cada dominio posee su propio sub-registro en su directorio de feature.
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  TWO_FACTOR: TWO_FACTOR_ENDPOINTS,
  USERS: USERS_ENDPOINTS,
  ROLES: ROLES_ENDPOINTS,
  FILES: FILES_ENDPOINTS,
  HEALTH: HEALTH_ENDPOINTS.HEALTH,
  FEATURE_FLAGS: FEATURE_FLAGS_ENDPOINTS,
  AUDIT: AUDIT_ENDPOINTS,
  PDF: PDF_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATIONS_ENDPOINTS,
  LOGS: SYSTEM_LOGS_ENDPOINTS,
  SYSTEM: {
    TELEMETRY: HEALTH_ENDPOINTS.TELEMETRY,
  },
  DISCORD_BOT: DISCORD_BOT_ENDPOINTS,
} as const;

export {
  AUTH_ENDPOINTS,
  TWO_FACTOR_ENDPOINTS,
  USERS_ENDPOINTS,
  ROLES_ENDPOINTS,
  FILES_ENDPOINTS,
  HEALTH_ENDPOINTS,
  FEATURE_FLAGS_ENDPOINTS,
  AUDIT_ENDPOINTS,
  PDF_ENDPOINTS,
  NOTIFICATIONS_ENDPOINTS,
  SYSTEM_LOGS_ENDPOINTS,
  DISCORD_BOT_ENDPOINTS,
};
