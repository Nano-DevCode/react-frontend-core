// ============================================================================
// CONTRATOS DE AUDITORÍA Y TRAZABILIDAD (/audit)
// ============================================================================

export interface AuditLogUserSummary {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Atributos universales y compartidos de un Registro de Auditoría
 */
export interface AuditLogBase {
  action: string; // "LOGIN", "UPDATE_USER", "UPLOAD_FILE", "DELETE_FILE"
  entity: string | null;
  entityId: string | null;
  ipAddress: string;
  userAgent: string | null;
  method: string;
  endpoint: string;
  details: Record<string, unknown> | null;
}

/**
 * Representación de un log de auditoría en listados y tablas (AuditLogListItemResponse)
 */
export interface AuditLogListItemResponse extends AuditLogBase {
  id: string;
  userId: string | null;
  createdAt: string;
  user?: AuditLogUserSummary | null;
}

/**
 * Representación detallada de un log de auditoría por su ID (AuditLogIdResponse)
 */
export type AuditLogIdResponse = AuditLogListItemResponse;

/**
 * Sobre de respuesta paginada o agrupada de auditoría (AuditLogListResponse)
 */
export interface AuditLogListResponse {
  audits?: AuditLogListItemResponse[];
  logs?: AuditLogListItemResponse[];
  data?: AuditLogListItemResponse[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type AuditLogRecord = AuditLogListItemResponse;
export type AuditLogDetailResponse = AuditLogIdResponse;
