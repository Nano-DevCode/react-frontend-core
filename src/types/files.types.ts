// ============================================================================
// CONTRATOS DE ARCHIVOS S3 Y SEAWEEDFS (/files)
// ============================================================================

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
  filename?: string;
}

export type FileResponseDto = UploadResult;

export type UploadMultipleResult = UploadResult[];

export interface UploadFileParams {
  file: File;
  customName?: string;
  bucket?: string;
  onProgress?: (percentage: number) => void;
}

export interface FileUrlResponse {
  key: string;
  url: string;
}

export interface DeleteFileResponse {
  message: string;
}

