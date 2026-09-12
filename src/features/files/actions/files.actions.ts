import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  UploadResult,
  UploadFileParams,
  FileUrlResponse,
  DeleteFileResponse,
} from '@/types/files.types';
import type { AxiosProgressEvent } from 'axios';

export const uploadFileAction = async ({
  file,
  customName,
  bucket,
  onProgress,
}: UploadFileParams): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  if (customName) formData.append('customName', customName);
  if (bucket) formData.append('bucket', bucket);

  const response = await apiClient.post<UploadResult>(
    API_ENDPOINTS.FILES.UPLOAD,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (e.total && onProgress) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      },
    }
  );

  return response.data;
};

export const uploadMultipleFilesAction = async (
  files: File[],
  customName?: string,
  bucket?: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  if (customName) formData.append('customName', customName);
  if (bucket) formData.append('bucket', bucket);

  const response = await apiClient.post<UploadResult[]>(
    API_ENDPOINTS.FILES.UPLOAD_MULTIPLE,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e: AxiosProgressEvent) => {
        if (e.total && onProgress) {
          const percent = Math.round((e.loaded * 100) / e.total);
          onProgress(percent);
        }
      },
    }
  );

  return response.data;
};

export const fetchPublicFileUrlAction = async (
  key: string,
  bucket?: string
): Promise<FileUrlResponse> => {
  const response = await apiClient.get<FileUrlResponse>(
    API_ENDPOINTS.FILES.PUBLIC(key),
    {
      params: { bucket },
    }
  );
  return response.data;
};

export const fetchPrivateFileUrlAction = async (
  key: string,
  bucket?: string
): Promise<FileUrlResponse> => {
  const response = await apiClient.get<FileUrlResponse>(
    API_ENDPOINTS.FILES.URL(key),
    {
      params: { bucket },
    }
  );
  return response.data;
};

export const deleteFileAction = async (
  key: string,
  bucket?: string
): Promise<DeleteFileResponse> => {
  const response = await apiClient.delete<DeleteFileResponse>(
    API_ENDPOINTS.FILES.DELETE(key),
    {
      params: { bucket },
    }
  );
  return response.data;
};

