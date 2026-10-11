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

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { mutate: updateUser, isPending } = useUpdateUserMutation();

  useEffect(() => {
    if (activeUser) {
      setName(activeUser.name || '');
      setEmail(activeUser.email || '');
      setPassword('');
      setFirstName(activeUser.profile?.firstName || '');
      setLastName(activeUser.profile?.lastName || '');
      setBio(activeUser.profile?.bio || '');
      setIsActive(activeUser.isActive ?? true);
      setSelectedRoles(activeUser.roles?.map((r) => r.role.name) || ['user']);
    }
  }, [activeUser]);

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
          name: name.trim() || undefined,
          email: email.trim(),
          password: password.trim() ? password.trim() : undefined,
          roles: selectedRoles,
          isActive,
          profile: {
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
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
          {/* Datos Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-xs flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>Nombre Completo</span>
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-email" className="text-xs flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>Correo Electrónico</span>
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
          </div>

          {/* Perfil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-2.5 rounded-lg border border-border/50">
            <div className="space-y-1">
              <Label htmlFor="edit-first-name" className="text-xs">
                <span>Primer Nombre (Perfil)</span>
              </Label>
              <Input
                id="edit-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-last-name" className="text-xs">
                <span>Apellido (Perfil)</span>
              </Label>
              <Input
                id="edit-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="edit-bio" className="text-xs">
                <span>Biografía</span>
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

