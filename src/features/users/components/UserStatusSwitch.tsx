import { Switch } from '@/components/ui/switch';
import { useToggleUserStatusMutation } from '../hooks/use-users';

interface UserStatusSwitchProps {
  userId: string;
  isActive: boolean;
}

export const UserStatusSwitch = ({ userId, isActive }: UserStatusSwitchProps) => {
  const { mutate: toggleStatus, isPending } = useToggleUserStatusMutation();

  return (
    <div className="notranslate flex items-center gap-2">
      <Switch
        checked={isActive}
        disabled={isPending}
        onCheckedChange={(checked) => {
          toggleStatus({ userId, isActive: checked });
        }}
      />
      <span className="text-xs text-muted-foreground select-none">
        <span>{isActive ? 'Activo' : 'Suspendido'}</span>
      </span>
    </div>
  );
};

