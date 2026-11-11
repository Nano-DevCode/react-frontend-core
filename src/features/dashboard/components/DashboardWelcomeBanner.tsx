import { Sparkles, HardDrive, KeyRound, Activity, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardWelcomeBannerProps {
  userName?: string;
  isAdmin?: boolean;
  onNavigateFiles: () => void;
  onNavigate2FA: () => void;
  onNavigateHealth: () => void;
  onNavigateDiscordBot?: () => void;
}

export const DashboardWelcomeBanner = ({
  userName = 'Usuario',
  isAdmin = false,
  onNavigateFiles,
  onNavigate2FA,
  onNavigateHealth,
  onNavigateDiscordBot,
}: DashboardWelcomeBannerProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-primary/5 p-6 sm:p-10 shadow-lg shadow-primary/5 hover-lift">
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-3.5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-semibold backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {isAdmin
              ? 'SaaS Enterprise Portal • Control Centralizado'
              : 'Portal de Usuario • Música y Seguridad'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground m-0">
          <span>Bienvenido,</span> <span>{userName}</span>.
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <span>
            {isAdmin
              ? 'Tu sesión está resguardada con tokens rotativos en Redis, políticas de acceso RBAC estrictas y escaneo antivirus en caliente para todos tus activos.'
              : 'Gestiona la seguridad 2FA de tu cuenta y controla el bot de música en tus propios servidores de Discord y canales de Twitch.'}
          </span>
        </p>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          {isAdmin ? (
            <Button
              variant="default"
              size="sm"
              onClick={onNavigateFiles}
              className="gap-2 text-xs shadow-md shadow-primary/20"
            >
              <HardDrive className="h-4 w-4" />
              <span>Explorador de Archivos</span>
            </Button>
          ) : (
            onNavigateDiscordBot && (
              <Button
                variant="default"
                size="sm"
                onClick={onNavigateDiscordBot}
                className="gap-2 text-xs shadow-md shadow-primary/20"
              >
                <Headphones className="h-4 w-4" />
                <span>Bot de Música Discord</span>
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onNavigate2FA}
            className="gap-2 text-xs bg-card/60 backdrop-blur-xs"
          >
            <KeyRound className="h-4 w-4" />
            <span>Configuración 2FA</span>
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateHealth}
              className="gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Activity className="h-4 w-4" />
              <span>Observabilidad en Vivo</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
