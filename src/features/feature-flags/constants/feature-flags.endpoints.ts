export const FEATURE_FLAGS_ENDPOINTS = {
  BASE: '/feature-flags',
  PUBLIC: '/feature-flags/public',
  BY_KEY: (key: string) => `/feature-flags/${key}`,
  BETA_FEATURE: '/beta-feature',
} as const;

