import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Panel de Control',
  '/usuarios': 'Directorio de Usuarios & RBAC',
  '/archivos': 'Gestor de Archivos S3 / SeaweedFS',
  '/auditoria': 'Trazabilidad y Auditoría',
  '/salud': 'Observabilidad del Sistema',
  '/seguridad-2fa': 'Doble Factor de Autenticación (2FA)',
  '/feature-flags': 'Gestión de Feature Flags',
};

export const Navbar = ({ onOpenMobileMenu }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const currentTitle = pageTitles[location.pathname] || 'Plataforma';

  const handleLogout = async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}, { suppressToast: true });
    } catch {
      // Ignorar error de red en logout
    } finally {
      logout();
      navigate('/login');
    }
  };

  const userInitials = (user?.email?.substring(0, 2) || 'US').toUpperCase();

  return (
    <header className="notranslate sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/75 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left section: Mobile menu button & breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 rounded-lg"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground m-0 leading-tight">
              <span>{currentTitle}</span>
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>En línea</span>
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            <span>Sistema Seguro</span> • <span>Protección RBAC & 2FA</span>
          </span>
        </div>
      </div>

      {/* Right section: Notification center, theme toggle & user menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationCenter />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 rounded-full flex items-center gap-2.5 px-1.5 sm:px-2 hover:bg-muted/80 border border-transparent hover:border-border/60 transition-all"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    <span>{userInitials}</span>
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>

              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-none">
                  <span>{user?.name || user?.email?.split('@')[0] || 'Usuario'}</span>
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-1 capitalize">
                  <span>{user?.roles?.[0] || 'user'}</span>
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 notranslate">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">
                  <span>{user?.name || 'Usuario'}</span>
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  <span>{user?.email}</span>
                </p>
                <div className="pt-1.5 flex gap-1 flex-wrap">
                  {user?.roles?.map((r) => (
                    <Badge key={r} variant="admin" className="text-[9px] py-0 px-1">
                      <span>{r}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate('/seguridad-2fa')} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4 text-primary" />
              <span>Configuración 2FA</span>
              {user?.isTwoFactorEnabled ? (
                <ShieldCheck className="ml-auto h-3.5 w-3.5 text-emerald-500" />
              ) : null}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

