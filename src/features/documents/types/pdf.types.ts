// ============================================================================
// CONTRATOS DE GENERACIÓN DE DOCUMENTOS PDF (/pdf)
// ============================================================================

export type PdfOrientation = 'portrait' | 'landscape';
export type PdfFormat = 'a4' | 'letter' | 'legal' | string;
export type PdfJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Atributos universales y compartidos de configuración de PDF
 */
export interface PdfBase {
  template?: string;
  title?: string;
  orientation?: PdfOrientation;
  format?: PdfFormat;
  filename?: string;
}

/**
 * DTO para la generación asíncrona de PDF (PdfGenerateDto)
 */
export interface PdfGenerateDto extends PdfBase {
  data?: Record<string, unknown>;
  htmlContent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * DTO para la previsualización síncrona en Blob de PDF (PdfPreviewSyncDto)
 */
export interface PdfPreviewSyncDto extends PdfBase {
  data?: Record<string, unknown>;
  htmlContent?: string;
  options?: Record<string, unknown>;
}

/**
 * Respuesta de generación de documento PDF
 */
export interface PdfGenerateResponse {
  success: boolean;
  fileKey: string;
  url?: string;
  filename?: string;
  size?: number;
  jobId?: string;
  message?: string;
}

/**
 * Representación detallada del estado de un trabajo de PDF por su ID (PdfIdResponse)
 */
export type PdfIdResponse = PdfGenerateResponse;

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type PdfGeneratePayload = PdfGenerateDto;
export type PdfPreviewSyncPayload = PdfPreviewSyncDto;
