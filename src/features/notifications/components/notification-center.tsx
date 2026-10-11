import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Download,
  Eye,
  FileText,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  BellOff,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotificationsQuery,
  useUnreadNotificationsCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '../hooks/use-notifications';
import { useNotificationsSocket } from '../hooks/use-notifications-socket';
import { openOrDownloadPdf } from '@/features/documents/utils/file-utils';
import type { AppNotification } from '../types/notification.types';

const formatTimeAgo = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin}m`;
    if (diffHour < 24) return `Hace ${diffHour}h`;
    if (diffDay < 7) return `Hace ${diffDay}d`;
    return date.toLocaleDateString();
  } catch {
    return '';
  }
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'pdf_generated':
    case 'file_ready':
      return <FileText className="h-4 w-4 text-purple-500 shrink-0" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-sky-500 shrink-0" />;
  }
};

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  // Activación de la conexión WebSocket para eventos en tiempo real
  const { isConnected } = useNotificationsSocket();

  // Queries reactivas de TanStack Query
  const { data: notifications = [], isLoading } = useNotificationsQuery();
  const { data: unreadCount = 0 } = useUnreadNotificationsCountQuery();

  // Mutaciones
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const handleDownloadPdf = async (
    e: React.MouseEvent,
    fileKey: string,
    filename?: string,
    action: 'download' | 'view' = 'download'
  ) => {
    e.stopPropagation();
    try {
      setDownloadingKey(fileKey);
      await openOrDownloadPdf(fileKey, { action, filename });
    } catch (err) {
      console.error('Error al descargar PDF desde notificación:', err);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleItemClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-muted/80 text-foreground transition-all"
          aria-label="Abrir centro de notificaciones"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-lg border-border/80 notranslate"
      >
        {/* Cabecera del Buzón */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-foreground">
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2"
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            onClick={() => markAllAsReadMutation.mutate()}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Leídas</span>
          </Button>
        </div>

        {/* Lista de Notificaciones */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <span className="text-xs">Cargando notificaciones...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground">
              <div className="rounded-full bg-muted/60 p-3 mb-2">
                <BellOff className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-medium text-foreground">Sin notificaciones pendientes</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Te avisaremos aquí cuando haya reportes listos o alertas del sistema.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const fileKey = n.data?.fileKey;
              const filename = n.data?.filename;
              const hasPdf = Boolean(fileKey) || n.type === 'pdf_generated';

              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-muted/50 ${
                    !n.read ? 'bg-primary/5 dark:bg-primary/10' : 'bg-transparent'
                  }`}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs leading-tight truncate ${
                          !n.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                        }`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                      {n.message}
                    </p>

                    {/* Botón de acción directa para PDFs generados */}
                    {hasPdf && fileKey && (
                      <div className="pt-1.5 flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 text-[10px] px-2 gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                          disabled={downloadingKey === fileKey}
                          onClick={(e) => handleDownloadPdf(e, fileKey, filename, 'download')}
                        >
                          {downloadingKey === fileKey ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          <span>Descargar PDF</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-1.5 text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleDownloadPdf(e, fileKey, filename, 'view')}
                          title="Previsualizar en pestaña segura"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Indicador de no leído */}
                  {!n.read && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Buzón con Estado de WebSocket */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 bg-muted/20 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Sincronizado en tiempo real
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-muted-foreground/60" />
                <span>Reconectando WebSocket...</span>
              </>
            )}
          </div>
          <span>{notifications.length} registros</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

