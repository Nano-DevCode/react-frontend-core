import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { refreshAuthSession } from '@/api/auth-session';
import { useAuthStore } from '@/stores/use-auth-store';
import type {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
  VerifyEmailResponse,
  ResendVerificationDto,
  ResendVerificationResponse,
  RefreshTokenResponse,
  LogoutResponse,
  AdminDashboardResponse,
  UsersExportResponse,
  UpdateProfileDto,
  UserAuthContext,
} from '../types/auth.types';

export const loginAction = async (dto: LoginDto): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, dto);
  return response.data;
};

export const registerAction = async (dto: RegisterDto): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, dto);
  return response.data;
};

export const updateProfileAction = async (
  dto: UpdateProfileDto
): Promise<UserAuthContext> => {
  const response = await apiClient.patch<UserAuthContext>(
    API_ENDPOINTS.AUTH.PROFILE,
    dto
  );
  return response.data;
};


export const verifyEmailAction = async (token: string): Promise<VerifyEmailResponse> => {
  const response = await apiClient.get<VerifyEmailResponse>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
    params: { token },
  });
  return response.data;
};

export const resendVerificationAction = async (
  dto: ResendVerificationDto
): Promise<ResendVerificationResponse> => {
  const response = await apiClient.post<ResendVerificationResponse>(
    API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
    dto
  );
  return response.data;
};

export const refreshTokenAction = async (): Promise<RefreshTokenResponse> => {
  const token = await refreshAuthSession();
  const user = useAuthStore.getState().user;
  return {
    accessToken: token,
    user: user || { id: '', email: '', roles: [], permissions: [] },
  };
};

export const logoutAction = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};

export const fetchAdminDashboardAction = async (): Promise<AdminDashboardResponse> => {
  const response = await apiClient.get<AdminDashboardResponse>(
    API_ENDPOINTS.AUTH.ADMIN_DASHBOARD
  );
  return response.data;
};

export const exportUsersAction = async (): Promise<UsersExportResponse> => {
  const response = await apiClient.get<UsersExportResponse>(API_ENDPOINTS.AUTH.USERS_EXPORT);
  return response.data;
};

