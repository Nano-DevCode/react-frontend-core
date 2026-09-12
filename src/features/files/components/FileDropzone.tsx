import { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle,
  Radio,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadFileAction } from '../actions/files.actions';
import { MalwareAlertModal } from './MalwareAlertModal';
import { cn } from '@/lib/utils';
import type { UploadResult } from '@/types/files.types';

export interface UploadFileItem {
  id: string;
  file: File;
  progress: number;
  phase: 'UPLOADING' | 'SCANNING' | 'OPTIMIZING' | 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

interface FileDropzoneProps {
  onUploadSuccess?: (result: UploadResult) => void;
}

export const FileDropzone = ({ onUploadSuccess }: FileDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadItems, setUploadItems] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [malwareError, setMalwareError] = useState<{
    fileName: string;
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const updateItem = useCallback(
    (id: string, partial: Partial<UploadFileItem>) => {
      setUploadItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...partial } : item))
      );
    },
    []
  );

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const rawFiles = Array.from(fileList);
    const validFiles: File[] = [];

    for (const file of rawFiles) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" excede el tamaño máximo permitido de 5 MB.`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    const newItems: UploadFileItem[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      progress: 0,
      phase: 'UPLOADING',
    }));

    setUploadItems(newItems);
    setIsUploading(true);

    // Ejecución paralela concurrente aprovechando el backend optimizado
    const uploadPromises = newItems.map(async (item) => {
      try {
        const result = await uploadFileAction({
          file: item.file,
          onProgress: (percent) => {
            updateItem(item.id, {
              progress: percent,
              phase: percent >= 100 ? 'SCANNING' : 'UPLOADING',
            });
          },
        });

        // Transición a optimización WebP
        updateItem(item.id, { phase: 'OPTIMIZING' });
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Éxito confirmado
        updateItem(item.id, { phase: 'SUCCESS', progress: 100 });
        if (onUploadSuccess) onUploadSuccess(result);
        return { success: true, item, result };
      } catch (err: unknown) {
        const msg = (
          err as { response?: { data?: { message?: string } } }
        )?.response?.data?.message;

        const isMalware =
          typeof msg === 'string' && msg.toLowerCase().includes('clamav');

        if (isMalware) {
          setMalwareError({
            fileName: item.file.name,
            message: msg,
          });
        }

        updateItem(item.id, {
          phase: 'ERROR',
          errorMessage: msg || 'Error al procesar archivo',
        });
        return { success: false, item, error: err };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter((r) => r.success).length;

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      if (results.length > 1) {
        toast.success(
          `Se procesaron exitosamente ${successCount} de ${results.length} archivos en S3`
        );
      }
    }

    setIsUploading(false);

    // Limpiar la lista de subida después de unos segundos de éxito
    setTimeout(() => {
      setUploadItems([]);
    }, 4000);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  // Cálculo de progreso global ponderado
  const totalFiles = uploadItems.length;
  const overallProgress =
    totalFiles > 0
      ? Math.round(
          uploadItems.reduce((acc, curr) => acc + curr.progress, 0) / totalFiles
        )
      : 0;

  const allCompleted =
    totalFiles > 0 &&
    uploadItems.every((i) => i.phase === 'SUCCESS' || i.phase === 'ERROR');

  return (
    <div className="notranslate space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer select-none',
          isDragOver
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/15'
            : 'border-border/80 bg-card/80 hover:border-primary/50 hover:bg-card shadow-sm hover-lift'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            // Reset input value para permitir resubir el mismo archivo si es necesario
            if (e.target) e.target.value = '';
          }}
          disabled={isUploading}
        />

        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5 transition-transform group-hover:scale-105">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-sm font-bold text-foreground">
          <span>Arrastra uno o varios archivos aquí o haz clic para examinar</span>
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
          <span>
            Formatos soportados: PDF, JPG, PNG, WebP (Hasta 5 MB c/u). Subida
            paralela concurrente con optimización WebP (-65% peso) y escaneo
            antivirus ClamAV.
          </span>
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="text-xs pointer-events-none bg-background/80"
          >
            <span>Seleccionar desde el equipo (Múltiple)</span>
          </Button>
        </div>
      </div>

      {/* Indicador Global y Desglose Concurrente de Archivos */}
      {uploadItems.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm space-y-4">
          {/* Header de Progreso General */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-xs font-bold text-foreground">
                <span>
                  {allCompleted
                    ? 'Procesamiento Concurrente Completado'
                    : `Procesando ${uploadItems.length} archivo(s) en paralelo...`}
                </span>
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-primary">
              <span>{overallProgress}%</span>
            </span>
          </div>

          <Progress
            value={overallProgress}
            indicatorClassName={allCompleted ? 'bg-emerald-500' : 'bg-primary'}
          />

          {/* Lista de Archivos en Progreso */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {uploadItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/30 p-2.5 text-xs transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                      <span>{item.file.name}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      <span>{(item.file.size / 1024).toFixed(1)} KB</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.phase === 'SUCCESS' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>S3 Asegurado</span>
                    </span>
                  ) : item.phase === 'SCANNING' ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-500">
                      <Radio className="h-3.5 w-3.5 animate-spin" />
                      <span>ClamAV...</span>
                    </span>
                  ) : item.phase === 'OPTIMIZING' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>WebP (-65%)...</span>
                    </span>
                  ) : item.phase === 'ERROR' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Error</span>
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-primary">
                        <span>{item.progress}%</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
            <span className={overallProgress < 100 ? 'text-primary font-bold' : ''}>
              <span>1️⃣ Transferencia Paralela</span>
            </span>
            <span className={uploadItems.some((i) => i.phase === 'SCANNING') ? 'text-amber-500 font-bold' : ''}>
              <span>2️⃣ Análisis ClamAV</span>
            </span>
            <span className={uploadItems.some((i) => i.phase === 'OPTIMIZING' || i.phase === 'SUCCESS') ? 'text-emerald-500 font-bold' : ''}>
              <span>3️⃣ Conversión WebP & S3</span>
            </span>
          </div>
        </div>
      )}

      {/* Modal de Alerta Antivirus ClamAV */}
      <MalwareAlertModal
        open={Boolean(malwareError)}
        fileName={malwareError?.fileName}
        errorMessage={malwareError?.message}
        onClose={() => setMalwareError(null)}
      />
    </div>
  );
};
