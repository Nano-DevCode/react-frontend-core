// ============================================================================
// CONTRATOS DE AUTENTICACIÓN EN DOS PASOS (/auth/2fa)
// ============================================================================

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

