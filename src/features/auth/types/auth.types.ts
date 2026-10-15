// ============================================================================
// CONTRATOS DE AUTENTICACIÓN Y SESIÓN (/auth)
// ============================================================================

/**
 * Atributos universales y compartidos de identidad de un usuario autenticado
 */
export interface UserAuthBase {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Contexto de sesión y permisos del usuario logueado
 */
export interface UserAuthContext extends UserAuthBase {
  roles: string[];
  permissions: string[];
  priority?: number;
  isTwoFactorEnabled?: boolean;
  isProfileComplete?: boolean;
}

/**
 * Representación de usuario devuelta en respuestas de autenticación (AuthUserIdResponse)
 */
export type AuthUserIdResponse = UserAuthContext;

/**
 * Base de datos personales compartida para registro y perfil
 */
export interface AuthUserPersonalBase {
  firstName: string;
  firstLastName: string;
  secondLastName: string;
}

/**
 * DTO para el registro de nuevos usuarios
 */
export interface RegisterDto extends AuthUserPersonalBase {
  email: string;
  password: string;
  name?: string;
}

/**
 * DTO para la actualización de perfil de usuario
 */
export interface UpdateProfileDto extends AuthUserPersonalBase {
  bio?: string;
  avatarUrl?: string;
}

/**
 * Respuesta del endpoint de registro
 */
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

/**
 * DTO para el inicio de sesión
 */
export interface LoginDto {
  email: string;
  password: string;
  trustDevice?: boolean;
}

/**
 * Respuesta de inicio de sesión exitoso con token
 */
export interface LoginSuccessResponse {
  accessToken: string;
  user: AuthUserIdResponse;
}

/**
 * Respuesta cuando la cuenta requiere desafío TOTP (2FA)
 */
export interface LoginTwoFactorRequiredResponse {
  require2FA: true;
  tempToken: string;
}

export type LoginResponse = LoginSuccessResponse | LoginTwoFactorRequiredResponse;

/**
 * Respuesta del endpoint de refresco de token
 */
export interface RefreshTokenResponse {
  accessToken: string;
  user: AuthUserIdResponse;
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
