import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { generatePdfAction, previewSyncPdfAction } from '../actions/pdf.actions';
import { openOrDownloadPdf } from '../utils/file-utils';
import type {
  PdfGeneratePayload,
  PdfGenerateResponse,
  PdfPreviewSyncPayload,
} from '@/types/pdf.types';

export const useGeneratePdfMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<PdfGenerateResponse, Error, PdfGeneratePayload>({
    mutationFn: (payload: PdfGeneratePayload) => generatePdfAction(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      toast.success(
        data.message || 'Documento PDF generado exitosamente',
        {
          id: `pdf-gen-${data.fileKey || Date.now()}`,
          action: data.fileKey
            ? {
                label: 'Descargar',
                onClick: () => {
                  void openOrDownloadPdf(data.fileKey, {
                    action: 'download',
                    filename: data.filename,
                  });
                },
              }
            : undefined,
        }
      );
    },
    onError: (error) => {
      console.error('[useGeneratePdfMutation] Error al generar PDF:', error);
    },
  });
};

export const usePreviewSyncPdfMutation = () => {
  return useMutation<Blob, Error, PdfPreviewSyncPayload>({
    mutationFn: (payload: PdfPreviewSyncPayload) => previewSyncPdfAction(payload),
    onSuccess: (blob) => {
      const objectUrl = window.URL.createObjectURL(blob);
      const newTab = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (!newTab) {
        // En caso de que el navegador bloquee popups, descargar como respaldo
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = 'previsualizacion.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
      toast.info('Previsualización de PDF abierta en una nueva pestaña.');
    },
    onError: (error) => {
      console.error('[usePreviewSyncPdfMutation] Error al previsualizar PDF:', error);
    },
  });
};

