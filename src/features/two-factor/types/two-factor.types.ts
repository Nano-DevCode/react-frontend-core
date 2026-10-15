// ============================================================================
// CONTRATOS DE AUTENTICACIÓN EN DOS PASOS (/auth/2fa)
// ============================================================================

/**
 * Atributos universales y compartidos de la configuración 2FA
 */
export interface TwoFactorBase {
  isEnabled: boolean;
}

/**
 * Estado actual del 2FA (TwoFactorStatusResponse)
 */
export type TwoFactorStatusResponse = TwoFactorBase;

/**
 * Respuesta con credenciales de configuración de 2FA y código QR
 */
export interface TwoFactorGenerateResponse {
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

/**
 * DTO para verificar código de 6 dígitos
 */
export interface TwoFactorCodeDto {
  code: string; // 6 dígitos numéricos
}

export type Toggle2FADto = TwoFactorCodeDto;

export interface TwoFactorTurnOnResponse {
  message: string;
}

export interface TwoFactorTurnOffResponse {
  message: string;
}

export interface TwoFactorAuthDto {
  tempToken?: string;
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
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type TwoFactorIdResponse = TwoFactorStatusResponse;
