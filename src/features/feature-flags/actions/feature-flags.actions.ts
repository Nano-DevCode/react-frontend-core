import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  BetaFeatureResponse,
  FeatureFlagListItemResponse,
  FeatureFlagListResponse,
  PublicFeatureFlagsResponse,
  PublicFeatureFlags,
} from '../types/feature-flags.types';

export type { PublicFeatureFlags, PublicFeatureFlagsResponse };


export const DEFAULT_FEATURE_FLAGS: FeatureFlagListItemResponse[] = [
  {
    id: 'ff-1',
    key: 'BETA_FEATURE',
    description: 'Acceso anticipado a endpoints y herramientas experimentales con verificación @RequireFeature.',
    isEnabled: true,
    rules: { percentage: 100, allowedRoles: ['admin', 'user'] },
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
  },
  {
    id: 'ff-2',
    key: 'DARK_MODE_V2',
    description: 'Motor de temas visuales dinámicos con soporte OLED y gradientes reactivos.',
    isEnabled: true,
    rules: { percentage: 100 },
    createdAt: '2026-09-02T10:00:00.000Z',
    updatedAt: '2026-09-10T12:00:00.000Z',
  },
  {
    id: 'ff-3',
    key: 'S3_MULTIPART_V2',
    description: 'Subida paralela por fragmentos (chunks) para archivos pesados mayores a 50 MB.',
    isEnabled: false,
    rules: { percentage: 0, allowedRoles: ['admin'] },
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-09-08T10:00:00.000Z',
  },
  {
    id: 'ff-4',
    key: 'DISCORD_BOT_ENABLED',
    description: 'Módulo del bot de música en Discord y orquestación con Lavalink v4.',
    isEnabled: true,
    rules: { percentage: 100, allowedRoles: ['admin', 'user'] },
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-16T12:00:00.000Z',
  },
  {
    id: 'ff-5',
    key: 'OAUTH_SOCIAL_LOGIN',
    description: 'Autenticación social federada (Master Switch).',
    isEnabled: true,
    rules: { percentage: 100 },
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T12:00:00.000Z',
  },
  {
    id: 'ff-6',
    key: 'OAUTH_GOOGLE',
    description: 'Inicio de sesión social con Google OAuth2.',
    isEnabled: true,
    rules: { percentage: 100 },
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T12:00:00.000Z',
  },
  {
    id: 'ff-7',
    key: 'OAUTH_FACEBOOK',
    description: 'Inicio de sesión social con Facebook Login.',
    isEnabled: true,
    rules: { percentage: 100 },
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T12:00:00.000Z',
  },
];

export const fetchFeatureFlagsAction = async (): Promise<FeatureFlagListItemResponse[]> => {
  try {
    const response = await apiClient.get<
      FeatureFlagListItemResponse[] | FeatureFlagListResponse
    >(API_ENDPOINTS.FEATURE_FLAGS.BASE, { suppressToast: true });

    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && typeof response.data === 'object') {
      const wrapped = response.data;
      if (Array.isArray(wrapped.data)) return wrapped.data;
      if (Array.isArray(wrapped.flags)) return wrapped.flags;
    }
    return DEFAULT_FEATURE_FLAGS;
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
};

export const toggleFeatureFlagAction = async (
  key: string,
  isEnabled: boolean
): Promise<FeatureFlagListItemResponse> => {
  try {
    const response = await apiClient.patch<FeatureFlagListItemResponse>(
      API_ENDPOINTS.FEATURE_FLAGS.BY_KEY(key),
      { isEnabled },
      { suppressToast: true }
    );
    return response.data;
  } catch {
    return {
      id: `ff-${key}`,
      key,
      description: null,
      isEnabled,
      rules: { percentage: isEnabled ? 100 : 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
};

export const fetchBetaFeatureAction = async (): Promise<BetaFeatureResponse> => {
  const response = await apiClient.get<BetaFeatureResponse>(
    API_ENDPOINTS.FEATURE_FLAGS.BETA_FEATURE,
    { suppressToast: true }
  );
  return response.data;
};

export const fetchPublicFeatureFlagsAction = async (): Promise<PublicFeatureFlagsResponse> => {
  try {
    const response = await apiClient.get<Record<string, unknown>>(
      API_ENDPOINTS.FEATURE_FLAGS.PUBLIC,
      { suppressToast: true }
    );
    const raw = (
      response.data && typeof response.data === 'object' && 'data' in response.data
        ? (response.data as { data: Record<string, unknown> }).data
        : response.data
    ) as Record<string, unknown> | null | undefined;

    return {
      oauth_social_login: Boolean(raw?.oauth_social_login),
      oauth_google: Boolean(raw?.oauth_google),
      oauth_facebook: Boolean(raw?.oauth_facebook),
      discord_bot: Boolean(raw?.discord_bot),
    };
  } catch {
    return {
      oauth_social_login: false,
      oauth_google: false,
      oauth_facebook: false,
      discord_bot: false,
    };
  }
};
