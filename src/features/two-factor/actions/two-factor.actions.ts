import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useAuthStore } from '@/stores/use-auth-store';
import type {
  TwoFactorGenerateResponse,
  TwoFactorCodeDto,
  TwoFactorTurnOnResponse,
  Toggle2FADto,
  TwoFactorTurnOffResponse,
  TwoFactorAuthDto,
  TwoFactorAuthenticateResponse,
  TwoFactorStatusResponse,
} from '../types/two-factor.types';
import type { CriticalActionResponse } from '@/features/auth/types/auth.types';

export const getTwoFactorStatusAction = async (): Promise<TwoFactorStatusResponse> => {
  try {
    const response = await apiClient.get<TwoFactorStatusResponse>(
      API_ENDPOINTS.TWO_FACTOR.STATUS,
      { suppressToast: true }
    );
    return response.data;
  } catch {
    const isEnabled = Boolean(useAuthStore.getState().user?.isTwoFactorEnabled);
    return { isEnabled };
  }
};

export const generateTwoFactorSecretAction = async (): Promise<TwoFactorGenerateResponse> => {
  const response = await apiClient.post<TwoFactorGenerateResponse>(
    API_ENDPOINTS.TWO_FACTOR.GENERATE
  );
  return response.data;
};

export const turnOnTwoFactorAction = async (
  dto: TwoFactorCodeDto
): Promise<TwoFactorTurnOnResponse> => {
  const response = await apiClient.post<TwoFactorTurnOnResponse>(
    API_ENDPOINTS.TWO_FACTOR.TURN_ON,
    dto
  );
  return response.data;
};

export const turnOffTwoFactorAction = async (
  dto: Toggle2FADto
): Promise<TwoFactorTurnOffResponse> => {
  const response = await apiClient.post<TwoFactorTurnOffResponse>(
    API_ENDPOINTS.TWO_FACTOR.TURN_OFF,
    dto
  );
  return response.data;
};

export const authenticateTwoFactorAction = async (
  dto: TwoFactorAuthDto
): Promise<TwoFactorAuthenticateResponse> => {
  const response = await apiClient.post<TwoFactorAuthenticateResponse>(
    API_ENDPOINTS.TWO_FACTOR.AUTHENTICATE,
    dto
  );
  return response.data;
};

export const executeCriticalAction = async (
  totpCode: string
): Promise<CriticalActionResponse> => {
  const response = await apiClient.post<CriticalActionResponse>(
    API_ENDPOINTS.AUTH.CRITICAL_ACTION,
    {},
    {
      headers: {
        'x-2fa-code': totpCode,
      },
    }
  );
  return response.data;
};

