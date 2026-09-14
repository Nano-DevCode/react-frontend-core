import { apiClient } from '@/api/client';

export interface OpenOrDownloadPdfOptions {
  action?: 'view' | 'download';
  filename?: string;
}

/**
 * Genera la URL relativa segura para visualización o descarga de un archivo.
 * REGLA ESTRICTA: NUNCA expone dominios absolutos de infraestructura como
 * localhost:8333, SeaweedFS o buckets S3 directos. Toda ruta pasa por /api/files/view/...
 */
export const getFileRelativeViewUrl = (fileKey: string): string => {
  if (!fileKey || typeof fileKey !== 'string') {
    return '/api/files/view/documento.pdf';
  }
  const cleanKey = fileKey.trim().replace(/^\/+/, '');
  return `/api/files/view/${encodeURIComponent(cleanKey)}`;
};

/**
 * Abre o descarga un PDF utilizando exclusivamente la ruta relativa con cookies/credenciales.
 * Utiliza apiClient con responseType: 'blob' para garantizar que las credenciales de autenticación
 * (cookies HttpOnly 'withCredentials: true' y Authorization header en memoria) se envíen en la petición.
 */
export const openOrDownloadPdf = async (
  fileKey: string,
  options?: OpenOrDownloadPdfOptions
): Promise<void> => {
  if (!fileKey) {
    throw new Error('No se proporcionó una clave de archivo (fileKey) válida.');
  }

  const action = options?.action ?? 'view';
  const rawFilename =
    options?.filename ||
    fileKey.split('/').pop() ||
    'documento_generado.pdf';
  const targetFilename = rawFilename.toLowerCase().endsWith('.pdf')
    ? rawFilename
    : `${rawFilename}.pdf`;

  const relativeUrl = getFileRelativeViewUrl(fileKey);

  try {
    // La petición viaja con withCredentials: true y headers Bearer del apiClient
    const response = await apiClient.get<Blob>(relativeUrl, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const objectUrl = window.URL.createObjectURL(blob);

    if (action === 'download') {
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = targetFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
    } else {
      // Abre en una nueva pestaña segura
      const newTab = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (!newTab) {
        // En caso de que el navegador bloquee popups, descargar como respaldo
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = targetFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      // Revocar el blob tras un tiempo prudencial para permitir carga del visor del navegador
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
    }
  } catch (error) {
    console.error(`[PDF Viewer] Error al obtener el documento (${relativeUrl}):`, error);
    throw error;
  }
};

