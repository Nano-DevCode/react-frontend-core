import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/use-auth-store';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { BentoGridSkeleton } from '@/components/shared/BentoGridSkeleton';
import { useFeatureFlagStatus } from '@/features/feature-flags/hooks/use-feature-flags';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const user = useAuthStore((state) => state.user);
  const userRoles = user?.roles || [];

  const hasAccess =
    userRoles.includes('admin') ||
    allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return (
      <div className="notranslate flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 my-8">
        <div className="rounded-full bg-destructive/10 p-4 text-destructive mb-4">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          <span>Acceso Restringido (403 Prohibido)</span>
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          <span>No cuentas con los privilegios RBAC suficientes para visualizar este módulo. Requieres alguno de los siguientes roles:</span>{' '}
          <span className="font-semibold text-foreground">{allowedRoles.join(', ')}</span>.
        </p>
        <div className="mt-6">
          <Button onClick={() => window.history.back()} variant="outline">
            <span>Regresar</span>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface FeatureFlagGuardProps {
  children: ReactNode;
  flagKey: string;
  fallback?: ReactNode;
}

export const FeatureFlagGuard = ({
  children,
  flagKey,
  fallback,
}: FeatureFlagGuardProps) => {
  const { isEnabled, isLoading } = useFeatureFlagStatus(flagKey);

  if (isLoading) {
    return fallback ? <>{fallback}</> : <BentoGridSkeleton />;
  }

  if (!isEnabled) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

