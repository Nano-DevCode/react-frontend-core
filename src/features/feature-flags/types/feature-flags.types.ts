// ============================================================================
// CONTRATOS DE FEATURE FLAGS (/beta-feature)
// ============================================================================

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

