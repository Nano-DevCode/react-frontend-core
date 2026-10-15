// ============================================================================
// CONTRATOS DE FEATURE FLAGS (/beta-feature y /feature-flags)
// ============================================================================

export interface BetaFeatureResponse {
  ok: boolean;
}

export interface FeatureFlagRules {
  allowedUsers?: string[];
  allowedRoles?: string[];
  percentage?: number; // 0 a 100
}

/**
 * Atributos universales y compartidos de un Feature Flag
 */
export interface FeatureFlagBase {
  key: string;
  description: string | null;
  isEnabled: boolean;
  rules: FeatureFlagRules | null;
}

/**
 * Representación de un Feature Flag en listados y tablas (FeatureFlagListItemResponse)
 */
export interface FeatureFlagListItemResponse extends FeatureFlagBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Representación detallada de un Feature Flag por su ID o clave (FeatureFlagIdResponse)
 */
export type FeatureFlagIdResponse = FeatureFlagListItemResponse;

/**
 * Sobre de respuesta con lista de feature flags (FeatureFlagListResponse)
 */
export interface FeatureFlagListResponse {
  data?: FeatureFlagListItemResponse[];
  flags?: FeatureFlagListItemResponse[];
}

/**
 * DTO para alternar o actualizar un Feature Flag
 */
export interface UpdateFeatureFlagDto {
  isEnabled?: boolean;
  description?: string | null;
  rules?: FeatureFlagRules | null;
}

/**
 * Flags públicos disponibles para clientes sin autenticación
 */
export interface PublicFeatureFlagsResponse {
  oauth_social_login: boolean;
  oauth_google: boolean;
  oauth_facebook: boolean;
  discord_bot?: boolean;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type FeatureFlagRecord = FeatureFlagListItemResponse;
export type FeatureFlagDetailResponse = FeatureFlagIdResponse;
export type PublicFeatureFlags = PublicFeatureFlagsResponse;
