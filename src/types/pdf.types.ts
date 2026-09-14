export type PdfOrientation = 'portrait' | 'landscape';
export type PdfFormat = 'a4' | 'letter' | 'legal' | string;
export type PdfJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PdfGeneratePayload {
  template?: string;
  title?: string;
  data?: Record<string, unknown>;
  htmlContent?: string;
  orientation?: PdfOrientation;
  format?: PdfFormat;
  metadata?: Record<string, unknown>;
  filename?: string;
}

export interface PdfGenerateResponse {
  success: boolean;
  fileKey: string;
  url?: string;
  filename?: string;
  size?: number;
  jobId?: string;
  message?: string;
}

export interface PdfPreviewSyncPayload {
  template?: string;
  title?: string;
  data?: Record<string, unknown>;
  htmlContent?: string;
  orientation?: PdfOrientation;
  options?: Record<string, unknown>;
}

