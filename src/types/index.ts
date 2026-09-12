// ============================================================================
// CONTRATOS DE TIPOS GLOBALES Y ESPECIFICACIÓN DE API
// Sincronizado estrictamente con FRONTEND_SPEC_README.md (Sección 10)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Contexto de Usuario Autenticado y Sesión
// ----------------------------------------------------------------------------
export interface UserAuthContext {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
  permissions: string[];
  isTwoFactorEnabled?: boolean;
}

// ----------------------------------------------------------------------------
// 2. Dominio de Autenticación (/auth)
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// 3. Dominio Independiente de Autenticación en Dos Pasos (/auth/2fa)
// ----------------------------------------------------------------------------
export interface TwoFactorStatusResponse {
  isEnabled: boolean;
}

export interface TwoFactorGenerateResponse {
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export interface TwoFactorCodeDto {
  code: string; // 6 dígitos numéricos
}

export interface TwoFactorTurnOnResponse {
  message: string;
}

export interface Toggle2FADto {
  code: string; // 6 dígitos numéricos
}

export interface TwoFactorTurnOffResponse {
  message: string;
}

export interface TwoFactorAuthDto {
  tempToken: string;
  code: string;
}

export interface TwoFactorAuthenticateResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
    isTwoFactorEnabled?: boolean;
  };
}

// ----------------------------------------------------------------------------
// 4. Dominio de Archivos S3 y SeaweedFS (/files)
// ----------------------------------------------------------------------------
export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
  filename?: string;
}

export type FileResponseDto = UploadResult;

export type UploadMultipleResult = UploadResult[];

export interface UploadFileParams {
  file: File;
  customName?: string;
  bucket?: string;
  onProgress?: (percentage: number) => void;
}

export interface FileUrlResponse {
  key: string;
  url: string;
}

export interface DeleteFileResponse {
  message: string;
}

// ----------------------------------------------------------------------------
// 5. Dominio de Salud e Infraestructura (/health)
// ----------------------------------------------------------------------------
export interface HealthIndicatorDetail {
  status: 'up' | 'down';
  [key: string]: unknown;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error' | 'shutting_down';
  info?: {
    database?: HealthIndicatorDetail;
    redis?: HealthIndicatorDetail;
    storage?: HealthIndicatorDetail;
  };
  error?: Record<string, HealthIndicatorDetail>;
  details: {
    database?: HealthIndicatorDetail;
    redis?: HealthIndicatorDetail;
    storage?: HealthIndicatorDetail;
  };
}

// ----------------------------------------------------------------------------
// 6. Dominio de Feature Flags y Rutas de Aplicación (/beta-feature)
// ----------------------------------------------------------------------------
export interface BetaFeatureResponse {
  ok: boolean;
}

export interface FeatureFlagRules {
  allowedUsers?: string[];
  allowedRoles?: string[];
  percentage?: number; // 0 a 100
}

export interface FeatureFlagRecord {
  id: string;
  key: string;
  description: string | null;
  isEnabled: boolean;
  rules: FeatureFlagRules | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// 7. Modelos de Base de Datos (Prisma ORM) y RBAC
// ----------------------------------------------------------------------------
export interface PermissionRecord {
  id: string;
  slug: string;
  description: string | null;
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: Array<{
    permission: PermissionRecord;
  }>;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    role: {
      name: string;
      permissions: Array<{
        permission: {
          slug: string;
        };
      }>;
    };
  }>;
  twoFactor?: {
    isEnabled: boolean;
  } | null;
}

export interface ToggleUserStatusDto {
  userId: string;
  isActive: boolean;
}

export interface AssignRoleDto {
  userId: string;
  roleNames: string[];
}

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  action: string; // "LOGIN", "UPDATE_USER", "UPLOAD_FILE", "DELETE_FILE"
  entity: string | null;
  entityId: string | null;
  ipAddress: string;
  userAgent: string | null;
  method: string;
  endpoint: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

// ----------------------------------------------------------------------------
// 8. Formato Estándar de Error de la API (HttpExceptionFilter)
// ----------------------------------------------------------------------------
export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

