/**
 * Helper para construir dinámicamente la URL de streaming/visualización
 * de un archivo en NestJS, evitando URLs absolutas o exposición de puertos de almacenamiento (SeaweedFS/S3).
 *
 * Endpoint de streaming autenticado (con cookies de sesión HttpOnly automáticas):
 * GET /api/files/view/:key
 */
export const getFileViewUrl = (key?: string | null): string => {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return '/placeholder-file.svg';
  }

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
  const cleanKey = key.trim().replace(/^\/+/, '');

  return `${baseUrl}/files/view/${encodeURIComponent(cleanKey)}`;
};

/**
 * Endpoint de streaming público (para archivos públicos sin sesión):
 * GET /api/files/public/:key
 */
export const getFilePublicUrl = (key?: string | null): string => {
  if (!key || typeof key !== 'string' || key.trim() === '') {
    return '/placeholder-file.svg';
  }

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '');
  const cleanKey = key.trim().replace(/^\/+/, '');

  return `${baseUrl}/files/public/${encodeURIComponent(cleanKey)}`;
};

