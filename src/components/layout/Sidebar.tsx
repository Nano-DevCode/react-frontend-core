import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useUIStore } from '@/stores/use-ui-store';
import { useAuthStore } from '@/stores/use-auth-store';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { navigationItems } from './navigation-items';

export const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  const userRoles = user?.roles || ['user'];
  const hasAccess = (roles: string[]) =>
    roles.some((r) => userRoles.includes(r)) || userRoles.includes('admin');

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          'notranslate hidden lg:flex flex-col border-r border-border/80 bg-card/80 backdrop-blur-2xl transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-30 shadow-xs',
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-border/60 transition-all duration-300 relative',
            isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'
          )}
        >
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-purple-600 to-indigo-600 text-white shadow-md shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold tracking-tight text-foreground">
                  <span>SaaS Enterprise</span>
                </span>
                <span className="truncate text-[10px] text-muted-foreground font-mono">
                  <span>v2.0 • Security Cloud</span>
                </span>
              </div>
            )}
          </NavLink>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0 transition-all duration-200',
              isSidebarCollapsed
                ? 'absolute -right-3 top-5 h-6 w-6 rounded-full border border-border bg-card shadow-md z-40 hover:bg-accent hover:scale-110'
                : 'h-8 w-8'
            )}
            aria-label={isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {navigationItems.map((item) => {
            if (!hasAccess(item.roles)) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            const linkContent = (
              <NavLink
                to={item.path}
                className={cn(
                  'flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative group select-none',
                  isSidebarCollapsed ? 'h-10 w-10 mx-auto justify-center p-0' : 'px-3 py-2.5 gap-3',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-md shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />

                {!isSidebarCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">
                      <span>{item.title}</span>
                    </span>
                    {item.badge && (
                      <Badge
                        variant={item.badge === 'Admin' ? 'admin' : 'outline'}
                        className={cn(
                          'text-[10px] px-1.5 py-0 font-medium',
                          isActive
                            ? 'bg-white/20 text-white border-transparent'
                            : ''
                        )}
                      >
                        <span>{item.badge}</span>
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            );

            if (isSidebarCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2 font-medium">
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="outline" className="text-[10px] px-1">
                        <span>{item.badge}</span>
                      </Badge>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.path}>{linkContent}</div>;
          })}
        </div>

        {/* Sidebar Footer: User Card */}
        <div className="p-3 border-t border-border/60 bg-muted/20">
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2.5 shadow-2xs">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                  <span>{(user?.email?.[0] || 'U').toUpperCase()}</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div className="flex flex-col truncate flex-1">
                <span className="truncate text-xs font-semibold text-foreground">
                  <span>{user?.name || user?.email || 'Usuario'}</span>
                </span>
                <span className="truncate text-[10px] text-muted-foreground capitalize">
                  <span>{user?.roles?.[0] || 'Invitado'}</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
                  <span>{(user?.email?.[0] || 'U').toUpperCase()}</span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};
