import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Shield, User, Mail, Lock } from 'lucide-react';
import { useUpdateUserMutation, useUserDetailQuery } from '../../hooks/use-users';
import type { UserRecord } from '../../types/users.types';

interface EditUserDialogProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_ROLES = [
  { name: 'superadmin', label: 'Super Admin (Prioridad: 100)' },
  { name: 'admin', label: 'Administrador (Prioridad: 50)' },
  { name: 'user', label: 'Usuario Estándar (Prioridad: 10)' },
];

export const EditUserDialog = ({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) => {
  const { data: detailData } = useUserDetailQuery(open && user ? user.id : null);
  const activeUser = detailData || user;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { mutate: updateUser, isPending } = useUpdateUserMutation();

  useEffect(() => {
    if (activeUser) {
      setEmail(activeUser.email || '');
      setPassword('');
      setFirstName(activeUser.profile?.firstName || '');
      setFirstLastName(activeUser.profile?.firstLastName || '');
      setSecondLastName(activeUser.profile?.secondLastName || '');


      setBio(activeUser.profile?.bio || '');
      setIsActive(activeUser.isActive ?? true);
      setSelectedRoles(activeUser.roles?.map((r) => r.role.name) || ['user']);
    }
  }, [activeUser]);

  const fullName = [firstName.trim(), firstLastName.trim(), secondLastName.trim()]
    .filter(Boolean)
    .join(' ');

  if (!user) return null;

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    updateUser(
      {
        id: user.id,
        dto: {
          name: fullName || undefined,
          email: email.trim(),
          password: password.trim() ? password.trim() : undefined,
          roles: selectedRoles,
          isActive,
          profile: {
            firstName: firstName.trim() || undefined,
            firstLastName: firstLastName.trim() || undefined,
            secondLastName: secondLastName.trim() || undefined,
            bio: bio.trim() || undefined,
          },
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>Editar Usuario</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            <span>Actualiza la información personal, credenciales, perfil y roles asignados.</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
          {/* Cuenta y Correo */}
          <div className="space-y-1">
            <Label htmlFor="edit-email" className="text-xs flex items-center gap-1 font-semibold">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span>Correo Electrónico *</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="h-8 text-xs font-mono"
            />
          </div>

          {/* Información Personal y Perfil */}
          <div className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border/50">
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Información Personal</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <Label htmlFor="edit-first-name" className="text-[11px]">
                  <span>Nombre(s)</span>
                </Label>
                <Input
                  id="edit-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Juan Carlos"
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-first-last-name" className="text-[11px]">
                  <span>Primer Apellido</span>
                </Label>
                <Input
                  id="edit-first-last-name"
                  value={firstLastName}
                  onChange={(e) => setFirstLastName(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-second-last-name" className="text-[11px]">
                  <span>Segundo Apellido</span>
                </Label>
                <Input
                  id="edit-second-last-name"
                  value={secondLastName}
                  onChange={(e) => setSecondLastName(e.target.value)}
                  placeholder="Ej. Gómez"
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            {/* Vista previa del Nombre Completo en el Sistema */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">
                  Nombre Completo en el Sistema
                </span>
                <p className="text-xs font-bold text-foreground">
                  <span>{fullName || activeUser?.name || 'Sin nombre asignado'}</span>
                </p>
              </div>
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary shrink-0">
                <span>Auto-generado</span>
              </Badge>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-bio" className="text-[11px]">
                <span>Biografía o Cargo</span>
              </Label>
              <Input
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Descripción o cargo"
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Contraseña Opcional */}
          <div className="space-y-1">
            <Label htmlFor="edit-password" className="text-xs flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Nueva Contraseña (Opcional - dejar en blanco para no cambiar)</span>
            </Label>
            <Input
              id="edit-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-8 text-xs"
            />
          </div>

          {/* Roles */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Roles Asignados</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map((r) => {
                const isSelected = selectedRoles.includes(r.name);
                return (
                  <Badge
                    key={r.name}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs py-1 px-2.5 transition-all select-none ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'opacity-70 hover:opacity-100 hover:bg-muted'
                    }`}
                    onClick={() => toggleRole(r.name)}
                  >
                    <span>{r.label}</span>
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Estado de Cuenta */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active" className="text-xs font-semibold cursor-pointer">
                <span>Estado de la Cuenta</span>
              </Label>
              <p className="text-[11px] text-muted-foreground">
                <span>{isActive ? 'El usuario puede iniciar sesión en la plataforma' : 'La cuenta está desactivada y no podrá ingresar'}</span>
              </p>
            </div>
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              <span>Cancelar</span>
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Guardar Cambios</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

