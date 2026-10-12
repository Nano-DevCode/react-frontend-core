import { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import { apiClient } from '@/api/client';
import { getFileViewUrl, getFilePublicUrl } from '@/utils/file-url';
import type { UploadResult } from '../types/files.types';

interface SecureFileImageProps {
  file: UploadResult;
  alt?: string;
  className?: string;
}

/**
 * Componente que renderiza imágenes almacenadas en S3 / SeaweedFS mediante streaming autenticado.
 * Evita bloqueos de CORP (Cross-Origin Resource Policy) y errores 401 descargando el archivo
 * como un Blob autenticado vía Axios (con Bearer token y cookies) y generando un ObjectURL local.
 */
export const SecureFileImage = ({ file, alt, className }: SecureFileImageProps) => {
  const [blobSrc, setBlobSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!file.previewUrl);
  const [hasError, setHasError] = useState<boolean>(false);

  const displaySrc = file.previewUrl || blobSrc;

  useEffect(() => {
    // Si ya existe previewUrl directa, no es necesario descargar el blob
    if (file.previewUrl) return;

    if (!file.key) {
      return;
    }

    let isMounted = true;
    let localBlobUrl: string | null = null;

    const fetchImageBlob = async () => {
      setIsLoading(true);
      setHasError(false);

      // 1. Intentar endpoint autenticado /files/view/:key
      try {
        const viewUrl = getFileViewUrl(file.key);
        const response = await apiClient.get<Blob>(viewUrl, {
          responseType: 'blob',
          suppressToast: true,
        });

        if (!isMounted) return;

        localBlobUrl = URL.createObjectURL(response.data);
        setBlobSrc(localBlobUrl);
        setIsLoading(false);
        return;
      } catch {
        // 2. Fallback: intentar endpoint público /files/public/:key
        try {
          const publicUrl = getFilePublicUrl(file.key);
          const response = await apiClient.get<Blob>(publicUrl, {
            responseType: 'blob',
            suppressToast: true,
          });

          if (!isMounted) return;

          localBlobUrl = URL.createObjectURL(response.data);
          setBlobSrc(localBlobUrl);
          setIsLoading(false);
          return;
        } catch {
          if (!isMounted) return;
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    fetchImageBlob();

    return () => {
      isMounted = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [file.key, file.previewUrl]);

  if (isLoading && !displaySrc) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  if (hasError || !displaySrc) {
    return (
      <div className="flex flex-col items-center justify-center gap-1.5 h-full w-full bg-muted/20 text-muted-foreground p-3">
        <ImageOff className="h-6 w-6 stroke-[1.5] text-muted-foreground/60" />
        <span className="text-[10px] font-medium text-center line-clamp-1 max-w-[90%]">
          {file.originalName}
        </span>
      </div>
    );
  }

  return (
    <img
      src={displaySrc}
      alt={alt || file.originalName}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

