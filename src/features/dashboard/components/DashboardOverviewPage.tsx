import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/use-auth-store';
import { useStepUpAuth } from '@/features/two-factor/hooks/use-step-up-auth';
import { StepUpModal } from '@/features/two-factor/components/StepUpModal';
import { DashboardWelcomeBanner } from './DashboardWelcomeBanner';
import { DashboardMetricsGrid } from './DashboardMetricsGrid';
import { DashboardStepUpCard } from './DashboardStepUpCard';

export default function DashboardOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const {
    isOpen: isStepUpOpen,
    isPending: isStepUpPending,
    requestStepUp,
    confirmCode,
    cancelStepUp,
  } = useStepUpAuth();

  const handleTriggerCriticalAction = async () => {
    try {
      await requestStepUp();
      toast.success('¡Acción crítica autorizada mediante cabecera x-2fa-code!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.info(err.message);
      }
    }
  };

  return (
    <div className="notranslate space-y-8">
      {/* Banner de Bienvenida */}
      <DashboardWelcomeBanner
        userName={user?.name || user?.email?.split('@')[0] || 'Administrador'}
        onNavigateFiles={() => navigate('/archivos')}
        onNavigate2FA={() => navigate('/seguridad-2fa')}
        onNavigateHealth={() => navigate('/salud')}
      />

      {/* Métricas Principales en Bento Grid */}
      <DashboardMetricsGrid
        primaryRole={user?.roles?.[0] || 'user'}
        isTwoFactorEnabled={Boolean(user?.isTwoFactorEnabled)}
      />

      {/* Probador Interactivo de Step-Up Auth para Acciones Críticas */}
      <DashboardStepUpCard
        onTriggerCriticalAction={handleTriggerCriticalAction}
      />

      {/* Modal de Step-Up para el disparador */}
      <StepUpModal
        open={isStepUpOpen}
        onOpenChange={() => {}}
        onConfirm={confirmCode}
        onCancel={cancelStepUp}
        isPending={isStepUpPending}
      />
    </div>
  );
}
