import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  User,
  Mail,
  Lock,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUserDetailQuery, useUpdateUserMutation } from '../hooks/use-users';

const AVAILABLE_ROLES = [
  { name: 'superadmin', label: 'Super Admin (Prioridad: 100)' },
  { name: 'admin', label: 'Administrador (Prioridad: 50)' },
  { name: 'user', label: 'Usuario Estándar (Prioridad: 10)' },
];

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useUserDetailQuery(id ?? null);
  const { mutate: updateUser, isPending } = useUpdateUserMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [firstLastName, setFirstLastName] = useState('');
  const [secondLastName, setSecondLastName] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setPassword('');
      setFirstName(user.profile?.firstName || '');

      const lastParts = (user.profile?.lastName || '').trim().split(/\s+/);
      setFirstLastName(user.profile?.firstLastName || lastParts[0] || '');
      setSecondLastName(user.profile?.secondLastName || lastParts.slice(1).join(' ') || '');

      setBio(user.profile?.bio || '');
      setIsActive(user.isActive ?? true);
      setSelectedRoles(user.roles?.map((r) => r.role.name) || ['user']);
    }
  }, [user]);

  const fullName = [firstName.trim(), firstLastName.trim(), secondLastName.trim()]
    .filter(Boolean)
    .join(' ');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground text-xs">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Cargando datos para edición...</span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">Usuario no encontrado</h3>
        <p className="text-xs text-muted-foreground">
          No se encontró el registro que deseas editar.
        </p>
        <Button size="sm" onClick={() => navigate('/usuarios')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Volver al directorio</span>
        </Button>
      </div>
    );
  }

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !id) return;

    updateUser(
      {
        id,
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
          navigate(`/usuarios/${id}`);
        },
      }
    );
  };

  return (
    <div className="notranslate max-w-3xl mx-auto space-y-6">
      {/* Botón Volver */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/usuarios/${id}`)}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al detalle</span>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground m-0 flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-primary" />
            <span>Editar Usuario: {user.name || user.email}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            <span>Actualiza la información personal, credenciales, perfil y roles asignados.</span>
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cuenta y Acceso */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>Cuenta y Acceso</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Correo electrónico principal, contraseña y estado de la cuenta.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-semibold">
                <span>Correo Electrónico *</span>
              </Label>
              <Input
                id="edit-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@sistema.com"
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5 pt-1 border-t border-border/40">
              <Label htmlFor="edit-password" className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                <span>Restablecer Contraseña (Opcional - dejar en blanco para conservar la actual)</span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-9 text-xs max-w-sm"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="edit-active" className="text-xs font-semibold cursor-pointer">
                  <span>Estado de la cuenta</span>
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  <span>{isActive ? 'La cuenta está activa y puede iniciar sesión.' : 'La cuenta está suspendida.'}</span>
                </p>
              </div>
              <Switch
                id="edit-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perfil Extendido: Nombre(s) y Apellidos */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Información Personal y Perfil</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Nombre(s) y apellidos del usuario. El nombre completo se actualiza automáticamente.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-first-name" className="text-xs font-semibold">
                  <span>Nombre(s)</span>
                </Label>
                <Input
                  id="edit-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Juan Carlos"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-first-last-name" className="text-xs font-semibold">
                  <span>Primer Apellido</span>
                </Label>
                <Input
                  id="edit-first-last-name"
                  value={firstLastName}
                  onChange={(e) => setFirstLastName(e.target.value)}
                  placeholder="Ej. Pérez"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-second-last-name" className="text-xs font-semibold">
                  <span>Segundo Apellido</span>
                </Label>
                <Input
                  id="edit-second-last-name"
                  value={secondLastName}
                  onChange={(e) => setSecondLastName(e.target.value)}
                  placeholder="Ej. Gómez"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Vista previa del Nombre Completo */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                  Nombre Completo en el Sistema
                </span>
                <p className="text-xs font-bold text-foreground">
                  <span>{fullName || user.name || 'Sin nombre asignado'}</span>
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
                <span>Auto-generado</span>
              </Badge>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-bio" className="text-xs font-semibold">
                <span>Biografía o Nota</span>
              </Label>
              <Input
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Descripción del puesto o notas"
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
              <span>Roles Asignados</span>
            </CardTitle>
            <CardDescription className="text-xs">
              <span>Selecciona los roles que determinan el nivel de acceso en la plataforma.</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_ROLES.map((r) => {
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
            onClick={() => navigate(`/usuarios/${id}`)}
            disabled={isPending}
            className="h-9 text-xs"
          >
            <span>Cancelar</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !email.trim()}
            className="h-9 gap-1.5 text-xs font-semibold px-5"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isPending ? 'Guardando Cambios...' : 'Guardar Cambios'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

