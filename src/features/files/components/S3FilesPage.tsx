import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { FileDropzone } from './FileDropzone';
import { FileGallery } from './FileGallery';
import { UploadResult } from '../types/files.types';

// Initial files list starts empty until uploaded
const INITIAL_FILES: UploadResult[] = [];

export default function S3FilesPage() {
  const [files, setFiles] = useState<UploadResult[]>(INITIAL_FILES);

  const handleUploadSuccess = (newFile: UploadResult) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  const handleFileDeleted = (key: string) => {
    setFiles((prev) => prev.filter((f) => f.key !== key));
  };

  return (
    <div className="notranslate space-y-6">
      {/* Header reutilizable */}
      <PageHeader
        title="Gestor de Archivos S3 & SeaweedFS"
        description="Almacenamiento en caliente con escaneo antivirus ClamAV Daemon y conversión automática a WebP."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiles(INITIAL_FILES)}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Restablecer Demo</span>
          </Button>
        }
      />

      {/* Zona Dropzone */}
      <FileDropzone onUploadSuccess={handleUploadSuccess} />

      {/* Galería de Archivos */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">
            <span>Archivos Almacenados ({files.length})</span>
          </h3>
        </div>
        <FileGallery files={files} onFileDeleted={handleFileDeleted} />
      </div>
    </div>
  );
}

