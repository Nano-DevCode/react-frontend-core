import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  HardDrive,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/stores/use-auth-store';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('admin');

  const navItems = [
    { title: 'Inicio', path: '/', icon: LayoutDashboard },
    ...(isAdmin ? [{ title: 'Usuarios', path: '/usuarios', icon: Users }] : []),
    { title: 'Archivos', path: '/archivos', icon: HardDrive },
    { title: 'Auditoría', path: '/auditoria', icon: Activity },
    { title: '2FA', path: '/seguridad-2fa', icon: ShieldCheck },
  ];

  return (
    <nav className="notranslate lg:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-border/80 bg-background/90 px-2 backdrop-blur-lg shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition-all duration-150 text-[11px] font-medium select-none',
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span><span>{item.title}</span></span>
          </NavLink>
        );
      })}
    </nav>
  );
};

