import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Lock,
  User,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCreateUserMutation } from '../hooks/use-users';
import { useRolesQuery } from '@/features/roles/hooks/use-roles';

const AVAILABLE_ROLES = [
  { name: 'superadmin', label: 'Super Admin (Prioridad: 100)' },
  { name: 'admin', label: 'Administrador (Prioridad: 50)' },
  { name: 'user', label: 'Usuario Estándar (Prioridad: 10)' },
];

export default function CreateUserPage() {
  const navigate = useNavigate();
  const { data: rolesResponse } = useRolesQuery({ all: true });

  const availableRoles = useMemo(() => {
    if (rolesResponse?.roles && rolesResponse.roles.length > 0) {
      return rolesResponse.roles.map((r) => ({
        name: r.name,
        label: `${r.name} (Prioridad: ${r.priority})`,
      }));
    }
    return AVAILABLE_ROLES;
  }, [rolesResponse]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['user']);

  const { mutate: createUser, isPending } = useCreateUserMutation();

  const fullName = [firstName.trim(), firstLastName.trim(), secondLastName.trim()]
    .filter(Boolean)
    .join(' ');

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (!firstName.trim() || !firstLastName.trim() || !secondLastName.trim()) return;

    createUser(
      {
        email: email.trim(),
        password: password.trim(),
        name: fullName,
        isActive,
        roles: selectedRoles.length > 0 ? selectedRoles : ['user'],
        profile: {
          firstName: firstName.trim(),
          firstLastName: firstLastName.trim(),
          secondLastName: secondLastName.trim(),
          bio: bio.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate('/usuarios');
        },
      }
    );
  };

  return (
    <div className="notranslate max-w-3xl mx-auto space-y-6">
      {/* Botón Volver y Encabezado */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/usuarios')}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al directorio</span>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground m-0 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <span>Crear Nuevo Usuario</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            <span>Registra una nueva cuenta en la plataforma asignando credenciales, roles y datos personales.</span>
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Credenciales de Acceso */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Credenciales de Acceso</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>El correo electrónico y contraseña indispensables para iniciar sesión.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-email" className="text-xs font-semibold flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Correo Electrónico *</span>
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  required
                  placeholder="usuario@sistema.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-password" className="text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Contraseña Inicial *</span>
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="create-active" className="text-xs font-semibold cursor-pointer">
                  <span>Habilitar cuenta inmediatamente</span>
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  <span>Si se desactiva, el usuario no podrá ingresar hasta ser activado manualmente.</span>
                </p>
              </div>
              <Switch
                id="create-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perfil del Usuario: Nombre(s) y Apellidos obligatorios */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Información Personal y Perfil</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Ingresa el nombre(s) y ambos apellidos. El nombre completo se generará automáticamente a partir de estos campos.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-first-name" className="text-xs font-semibold">
                  <span>Nombre(s) *</span>
                </Label>
                <Input
                  id="create-first-name"
                  required
                  placeholder="Ej. Juan Carlos"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-first-last-name" className="text-xs font-semibold">
                  <span>Primer Apellido *</span>
                </Label>
                <Input
                  id="create-first-last-name"
                  required
                  placeholder="Ej. Pérez"
                  value={firstLastName}
                  onChange={(e) => setFirstLastName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-second-last-name" className="text-xs font-semibold">
                  <span>Segundo Apellido *</span>
                </Label>
                <Input
                  id="create-second-last-name"
                  required
                  placeholder="Ej. Gómez"
                  value={secondLastName}
                  onChange={(e) => setSecondLastName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Vista previa del Nombre Completo generado */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  Nombre Completo Generado en el Sistema
                </span>
                <p className="text-xs font-bold text-foreground">
                  {fullName ? (
                    <span>{fullName}</span>
                  ) : (
                    <span className="text-muted-foreground italic font-normal">
                      Completa los 3 campos de nombres y apellidos arriba...
                    </span>
                  )}
                </p>
              </div>
              {fullName && (
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
                  <span>Auto-generado</span>
                </Badge>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-bio" className="text-xs font-semibold">
                <span>Biografía o Nota del Perfil (Opcional)</span>
              </Label>
              <Input
                id="create-bio"
                placeholder="Ej. Desarrollador Backend o Asesor de Soporte"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles y Jerarquía */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Asignación de Roles</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Selecciona los roles que determinarán los privilegios y accesos del nuevo usuario.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap gap-2.5">
              {availableRoles.map((r) => {
                const isSelected = selectedRoles.includes(r.name);
                return (
                  <Badge
                    key={r.name}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs py-1.5 px-3 transition-all select-none ${
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
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/usuarios')}
            disabled={isPending}
            className="h-9 text-xs"
          >
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={
              isPending ||
              !email.trim() ||
              !password.trim() ||
              !firstName.trim() ||
              !firstLastName.trim() ||
              !secondLastName.trim()
            }
            className="h-9 gap-1.5 text-xs font-semibold px-5"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isPending ? 'Creando Usuario...' : 'Crear Usuario'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

