// ============================================================================
// CONTRATOS DE AUDITORÍA Y TRAZABILIDAD (/audit)
// ============================================================================

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

