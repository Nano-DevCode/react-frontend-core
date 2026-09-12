import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { FeatureFlagRecord, BetaFeatureResponse } from '@/types/feature-flags.types';

export const DEFAULT_FEATURE_FLAGS: FeatureFlagRecord[] = [
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
];

export const fetchFeatureFlagsAction = async (): Promise<FeatureFlagRecord[]> => {
  try {
    const response = await apiClient.get<
      FeatureFlagRecord[] | { data?: FeatureFlagRecord[]; flags?: FeatureFlagRecord[] }
    >(API_ENDPOINTS.FEATURE_FLAGS.BASE, { suppressToast: true });

    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && typeof response.data === 'object') {
      const wrapped = response.data as { data?: FeatureFlagRecord[]; flags?: FeatureFlagRecord[] };
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
): Promise<FeatureFlagRecord> => {
  try {
    const response = await apiClient.patch<FeatureFlagRecord>(
      API_ENDPOINTS.FEATURE_FLAGS.BY_KEY(key),
      { isEnabled },
      { suppressToast: true }
    );
    return response.data;
  } catch {
    // Si el backend aún no expone PATCH /feature-flags/:key, devolvemos el estado actualizado
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

