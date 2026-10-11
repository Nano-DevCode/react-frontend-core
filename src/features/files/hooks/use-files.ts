import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  uploadFileAction,
  uploadMultipleFilesAction,
  fetchPrivateFileUrlAction,
  deleteFileAction,
} from '../actions/files.actions';
import { UploadFileParams } from '../types/files.types';

export const useFileUploadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UploadFileParams) => uploadFileAction(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(`¡Archivo "${data.originalName}" subido y optimizado a WebP con éxito!`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (typeof msg === 'string' && msg.toLowerCase().includes('clamav')) {
        toast.error('Archivo rechazado: amenaza de virus detectada por ClamAV');
      }
    },
  });
};

export const useMultipleFilesUploadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      customName,
      bucket,
    }: {
      files: File[];
      customName?: string;
      bucket?: string;
    }) => uploadMultipleFilesAction(files, customName, bucket),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success(`Se procesaron y aseguraron ${data.length} archivos en S3`);
    },
  });
};

export const useDeleteFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, bucket }: { key: string; bucket?: string }) =>
      deleteFileAction(key, bucket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Archivo eliminado permanentemente de S3');
    },
  });
};

export const usePrivateFileUrlQuery = (key: string | null, bucket?: string) => {
  return useQuery({
    queryKey: ['files', 'url', key, bucket],
    queryFn: () => fetchPrivateFileUrlAction(key as string, bucket),
    enabled: Boolean(key),
  });
};

