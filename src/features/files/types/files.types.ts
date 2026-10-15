// ============================================================================
// CONTRATOS DE ARCHIVOS S3 Y ALMACENAMIENTO (/files)
// ============================================================================

/**
 * Atributos universales y compartidos de un Archivo
 */
export interface FileBase {
  key: string;
  bucket: string;
  size: number;
  mimetype: string;
  originalName: string;
  filename?: string;
}

/**
 * Representación de un archivo en respuestas individuales o de subida (FileListItemResponse)
 */
export interface FileListItemResponse extends FileBase {
  url: string;
  previewUrl?: string;
}

/**
 * Representación detallada de un archivo por su clave o ID (FileIdResponse)
 */
export type FileIdResponse = FileListItemResponse;

/**
 * Sobre de respuesta de listado de archivos (FileListResponse)
 */
export interface FileListResponse {
  files: FileListItemResponse[];
  total?: number;
}

/**
 * DTO para la subida de un archivo
 */
export interface UploadFileDto {
  file: File;
  customName?: string;
  bucket?: string;
  onProgress?: (percentage: number) => void;
}

/**
 * Respuesta con URL pre-firmada o pública de un archivo
 */
export interface FileUrlResponse {
  key: string;
  url: string;
}

/**
 * Respuesta tras la eliminación de un archivo
 */
export interface DeleteFileResponse {
  message: string;
}

// ----------------------------------------------------------------------------
// ALIASES DE RETROCOMPATIBILIDAD
// ----------------------------------------------------------------------------
export type UploadResult = FileListItemResponse;
export type FileResponseDto = FileListItemResponse;
export type UploadMultipleResult = FileListItemResponse[];
export type UploadFileParams = UploadFileDto;
