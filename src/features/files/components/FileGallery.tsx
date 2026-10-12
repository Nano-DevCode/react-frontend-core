import { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SecureFileImage } from './SecureFileImage';
import { useDeleteFileMutation } from '../hooks/use-files';
import { getFileViewUrl } from '@/utils/file-url';
import { toast } from 'sonner';
import { UploadResult } from '../types/files.types';

interface FileGalleryProps {
  files: UploadResult[];
  onFileDeleted?: (key: string) => void;
}

export const FileGallery = ({ files, onFileDeleted }: FileGalleryProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<UploadResult | null>(null);
  const [previewModalFile, setPreviewModalFile] = useState<UploadResult | null>(null);

  const { mutate: deleteFile, isPending: isDeleting } = useDeleteFileMutation();

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.success('URL del archivo copiada al portapapeles');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;
    deleteFile(
      { key: fileToDelete.key, bucket: fileToDelete.bucket },
      {
        onSuccess: () => {
          if (onFileDeleted) onFileDeleted(fileToDelete.key);
          setFileToDelete(null);
        },
      }
    );
  };

  if (files.length === 0) {
    return (
      <EmptyState
        title="Sin archivos almacenados"
        description="No hay archivos cargados recientemente en el almacenamiento SeaweedFS / S3."
      />
    );
  }

  return (
    <div className="notranslate space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => {
          const isImage =
            file.mimetype?.toLowerCase().startsWith('image/') ||
            /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(file.originalName);
          const formattedSize = (file.size / 1024).toFixed(1);
          const isWebp = file.mimetype?.includes('webp');

          return (
            <Card key={file.key} className="overflow-hidden border-border/80 group hover-lift bg-card/90">
              <div
                className={`relative h-40 w-full bg-muted/40 flex items-center justify-center overflow-hidden border-b border-border/40 ${
                  isImage ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (isImage) setPreviewModalFile(file);
                }}
                title={isImage ? 'Haz clic para ampliar la imagen' : undefined}
              >
                {isImage ? (
                  <SecureFileImage
                    file={file}
                    alt={file.originalName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-medium text-foreground">
                      <span>Documento {file.mimetype.includes('pdf') ? 'PDF' : 'Adjunto'}</span>
                    </span>
                  </div>
                )}

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 pointer-events-none">
                  {isWebp && (
                    <Badge variant="outline" className="bg-background/90 backdrop-blur-xs text-[10px] text-indigo-600 dark:text-indigo-400 border-indigo-500/30 font-mono">
                      <span>-65% WebP</span>
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-background/90 backdrop-blur-xs text-[10px] gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Limpio</span>
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-bold text-foreground truncate" title={file.originalName}>
                      <span>{file.originalName}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate">
                      <span>{file.key}</span>
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[9px] uppercase shrink-0 font-mono">
                    <span>{file.mimetype.split('/')[1] || 'FILE'}</span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-[11px] text-muted-foreground">
                  <span><span>Tamaño:</span> <strong className="text-foreground font-mono">{formattedSize} KB</strong></span>
                  <div className="flex items-center gap-1">
                    {isImage && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setPreviewModalFile(file)}
                        title="Ver imagen ampliada"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopyUrl(getFileViewUrl(file.key), file.key)}
                      title="Copiar URL directa"
                    >
                      {copiedKey === file.key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        window.open(
                          getFileViewUrl(file.key),
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      title="Abrir en nueva pestaña"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => setFileToDelete(file)}
                      title="Eliminar archivo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Previsualización Ampliada */}
      <Dialog
        open={Boolean(previewModalFile)}
        onOpenChange={(open) => !open && setPreviewModalFile(null)}
      >
        <DialogContent className="notranslate max-w-3xl p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold truncate">
              {previewModalFile?.originalName}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground truncate">
              Clave: {previewModalFile?.key}
            </DialogDescription>
          </DialogHeader>
          {previewModalFile && (
            <div className="flex items-center justify-center max-h-[70vh] overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-2">
              <SecureFileImage
                file={previewModalFile}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Borrado Reutilizable */}
      <ConfirmDialog
        open={Boolean(fileToDelete)}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        title="Confirmar Eliminación"
        description={
          <>
            ¿Estás seguro de que deseas eliminar permanentemente{' '}
            <strong className="text-foreground">{fileToDelete?.originalName}</strong> del bucket
            SeaweedFS / S3? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar de S3"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
