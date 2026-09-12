// ============================================================================
// CONTRATOS GENERALES DE RESPUESTA DE API
// ============================================================================

export interface ApiErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

