import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  PdfGeneratePayload,
  PdfGenerateResponse,
  PdfPreviewSyncPayload,
} from '@/types/pdf.types';

export const generatePdfAction = async (
  payload: PdfGeneratePayload
): Promise<PdfGenerateResponse> => {
  const response = await apiClient.post<PdfGenerateResponse>(
    API_ENDPOINTS.PDF.GENERATE,
    payload
  );
  return response.data;
};

export const previewSyncPdfAction = async (
  payload: PdfPreviewSyncPayload
): Promise<Blob> => {
  const response = await apiClient.post<Blob>(
    API_ENDPOINTS.PDF.PREVIEW_SYNC,
    payload,
    {
      responseType: 'blob',
    }
  );
  return new Blob([response.data], { type: 'application/pdf' });
};

