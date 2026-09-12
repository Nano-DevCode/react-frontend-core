import { ShieldCheck, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// 8 deterministic mock backup codes for demonstration and download
const SAMPLE_BACKUP_CODES = [
  'A8F4-99D2',
  '7BC1-EE40',
  '34DA-8801',
  '912C-55FA',
  '12BE-AA99',
  '77F0-BC33',
  '45CD-EE11',
  '88AA-99FF',
];

interface TwoFactorActiveViewProps {
  userEmail?: string;
}

export const TwoFactorActiveView = ({ userEmail }: TwoFactorActiveViewProps) => {
  const downloadBackupCodes = () => {
    const text =
      `CÓDIGOS DE RESPALDO - SISTEMA SAAS EMPRESARIAL\n` +
      `Usuario: ${userEmail || 'usuario'}\n` +
      `Fecha: ${new Date().toISOString()}\n\n` +
      SAMPLE_BACKUP_CODES.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nGuarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${userEmail || 'seguridad'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Códigos de respaldo descargados');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 notranslate">
      {/* Tarjeta de Información de Seguridad */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle className="text-base">
              <span>Tu cuenta está protegida</span>
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            <span>
              La autenticación en dos pasos está activa. El sistema te solicitará un código cada vez que inicies sesión desde un nuevo dispositivo o ejecutes acciones de alto riesgo.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-muted-foreground">
          <div className="rounded-xl border border-border/50 bg-background p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground"><span>Algoritmo:</span></span>
              <span className="font-mono"><span>HMAC-SHA1 (RFC 6238)</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground"><span>Intervalo:</span></span>
              <span><span>30 segundos</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground"><span>Cifrado:</span></span>
              <span><span>AES-256-GCM en reposo</span></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuadrícula de Backup Codes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              <span>Códigos de Respaldo</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadBackupCodes}
              className="h-8 gap-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar (.txt)</span>
            </Button>
          </div>
          <CardDescription className="text-xs">
            <span>Úsalos si pierdes el acceso a tu teléfono o aplicación autenticadora.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {SAMPLE_BACKUP_CODES.map((code, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
              >
                <span className="text-muted-foreground"><span>#{idx + 1}</span></span>
                <span className="font-bold text-foreground tracking-wider"><span>{code}</span></span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

