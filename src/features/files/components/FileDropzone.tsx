import { useState, useRef } from 'react';
import {
  UploadCloud,
  File as FileIcon,
  CheckCircle,
  Radio,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFileUploadMutation } from '../hooks/use-files';
import { MalwareAlertModal } from './MalwareAlertModal';
import { cn } from '@/lib/utils';
import type { UploadResult } from '@/types';

interface FileDropzoneProps {
  onUploadSuccess?: (result: UploadResult) => void;
}

export const FileDropzone = ({ onUploadSuccess }: FileDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [phase, setPhase] = useState<'IDLE' | 'UPLOADING' | 'SCANNING' | 'OPTIMIZING' | 'SUCCESS'>('IDLE');
  const [malwareError, setMalwareError] = useState<{ fileName: string; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadFile, isPending } = useFileUploadMutation();

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    // Validación cliente de tamaño (máx 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo permitido de 5 MB.');
      return;
    }

    setCurrentFile(file);
    setUploadPercent(0);
    setPhase('UPLOADING');

    uploadFile(
      {
        file,
        onProgress: (percent) => {
          setUploadPercent(percent);
          if (percent >= 100) {
            setPhase('SCANNING');
          }
        },
      },
      {
        onSuccess: (data) => {
          setPhase('OPTIMIZING');
          setTimeout(() => {
            setPhase('SUCCESS');
            if (onUploadSuccess) onUploadSuccess(data);
            setTimeout(() => {
              setPhase('IDLE');
              setCurrentFile(null);
            }, 3000);
          }, 1200);
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          const isMalware = typeof msg === 'string' && msg.toLowerCase().includes('clamav');
          if (isMalware) {
            setMalwareError({
              fileName: file.name,
              message: msg,
            });
          }
          setPhase('IDLE');
          setCurrentFile(null);
        },
      }
    );
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="notranslate space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isPending && fileInputRef.current?.click()}
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
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isPending}
        />

        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-4 ring-primary/5 transition-transform group-hover:scale-105">
          <UploadCloud className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-sm font-bold text-foreground">
          <span>Arrastra tus archivos aquí o haz clic para examinar</span>
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground max-w-md leading-relaxed">
          <span>Formatos soportados: PDF, JPG, PNG, WebP (Hasta 5 MB). Cada imagen es optimizada automáticamente a WebP (-65% peso) y analizada contra malware con ClamAV Daemon.</span>
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Button variant="outline" size="sm" type="button" className="text-xs pointer-events-none bg-background/80">
            <span>Seleccionar desde el equipo</span>
          </Button>
        </div>
      </div>

      {/* Indicador Reactivo del Proceso en 3 Fases */}
      {phase !== 'IDLE' && currentFile && (
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground truncate max-w-[240px]">
                  <span>{currentFile.name}</span>
                </span>
                <span className="text-[10px] text-muted-foreground">
                  <span>{(currentFile.size / 1024).toFixed(1)} KB</span>
                </span>
              </div>
            </div>

            {phase === 'SUCCESS' ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                <CheckCircle className="h-4 w-4" />
                <span>Resguardado en S3</span>
              </span>
            ) : phase === 'SCANNING' ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <Radio className="h-4 w-4 animate-spin" />
                <span>Escaneando con ClamAV...</span>
              </span>
            ) : phase === 'OPTIMIZING' ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-indigo-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Comprimiendo a WebP (-65%)...</span>
              </span>
            ) : (
              <span className="text-xs font-mono font-bold text-primary">
                <span>{uploadPercent}%</span>
              </span>
            )}
          </div>

          <Progress
            value={phase === 'UPLOADING' ? uploadPercent : 100}
            indicatorClassName={
              phase === 'SUCCESS'
                ? 'bg-emerald-500'
                : phase === 'SCANNING'
                ? 'bg-amber-500'
                : 'bg-primary'
            }
          />

          <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
            <span className={phase === 'UPLOADING' ? 'text-primary font-bold' : ''}>
              <span>1️⃣ Transfiriendo archivo</span>
            </span>
            <span className={phase === 'SCANNING' ? 'text-amber-500 font-bold' : ''}>
              <span>2️⃣ Verificación ClamAV</span>
            </span>
            <span className={phase === 'OPTIMIZING' || phase === 'SUCCESS' ? 'text-emerald-500 font-bold' : ''}>
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

