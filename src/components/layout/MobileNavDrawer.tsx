import { NavLink } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { navigationItems } from './navigation-items';
import { useAuthStore } from '@/stores/use-auth-store';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavDrawer = ({ open, onOpenChange }: MobileNavDrawerProps) => {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.roles || ['user'];

  const hasAccess = (roles: string[]) =>
    roles.some((r) => userRoles.includes(r)) || userRoles.includes('admin');

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="notranslate max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50 pb-3">
          <DrawerTitle className="text-left text-base font-bold">
            <span>Menú de Navegación</span>
          </DrawerTitle>
          <DrawerDescription className="text-left text-xs">
            <span>Acceso rápido a todos los módulos autorizados del sistema</span>
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 py-3 space-y-1">
          {navigationItems.map((item) => {
            if (!hasAccess(item.roles)) return null;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onOpenChange(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">
                  <span>{item.title}</span>
                </span>
                {item.badge && (
                  <Badge variant="outline" className="text-[10px]">
                    <span>{item.badge}</span>
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

