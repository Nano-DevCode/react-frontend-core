// ============================================================================
// CONTRATOS DE AUTENTICACIÓN Y SESIÓN (/auth)
// ============================================================================

export interface UserAuthContext {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  permissions: string[];
  isTwoFactorEnabled?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
}

export interface VerifyEmailQueryDto {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ResendVerificationResponse {
  message: string;
}

export interface LoginDto {
  email: string;
  password: string;
  trustDevice?: boolean;
}

export interface LoginSuccessResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled?: boolean;
  };
}

export interface LoginTwoFactorRequiredResponse {
  require2FA: true;
  tempToken: string;
}

export type LoginResponse = LoginSuccessResponse | LoginTwoFactorRequiredResponse;

export interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled?: boolean;
  };
}

export interface LogoutResponse {
  message: string;
}

export interface AdminDashboardResponse {
  message: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled?: boolean;
  };
}

export interface UsersExportResponse {
  message: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled?: boolean;
  };
}

export interface CriticalActionResponse {
  message: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled?: boolean;
  };
}

