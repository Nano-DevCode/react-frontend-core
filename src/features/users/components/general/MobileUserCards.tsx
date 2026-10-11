import { useState } from 'react';
import {
  Edit3,
  ShieldCheck,
  MoreHorizontal,
  Eye,
  UserX,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserDetailsDialog } from '../crud/UserDetailsDialog';
import { EditUserDialog } from '../crud/EditUserDialog';
import { UserLifecycleDialog } from '../crud/UserLifecycleDialog';
import type { UserRecord } from '../../types/users.types';

interface MobileUserCardsProps {
  users: UserRecord[];
}

export const MobileUserCards = ({ users }: MobileUserCardsProps) => {
  const safeUsers = Array.isArray(users) ? users : [];
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [lifecycleUser, setLifecycleUser] = useState<UserRecord | null>(null);

  return (
    <div className="notranslate space-y-3">
      {safeUsers.map((user) => {
        const initials = (user.name?.[0] || user.email[0] || 'U').toUpperCase();
        const isDeleted = Boolean(user.deletedAt);

        return (
          <Card key={user.id} className="overflow-hidden border-border/70">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      <span>{initials}</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-foreground">
                        <span>{user.name || 'Sin nombre registrado'}</span>
                      </span>
                      {isDeleted && (
                        <Badge variant="destructive" className="text-[9px] py-0 px-1.5 h-4">
                          <span>Baja</span>
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                      <span>{user.email}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isDeleted ? (
                    <Badge variant="destructive" className="text-[10px] py-0 px-2 font-medium">
                      <span>En Papelera</span>
                    </Badge>
                  ) : user.isActive ? (
                    <Badge
                      variant="default"
                      className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-2 font-medium"
                    >
                      <span>Activo</span>
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                      <span>Suspendido</span>
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-xs">
                      <DropdownMenuItem
                        onClick={() => setViewingUser(user)}
                        className="cursor-pointer gap-2"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Ver detalles</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => setEditingUser(user)}
                        className="cursor-pointer gap-2"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                        <span>Editar usuario</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {isDeleted ? (
                        <DropdownMenuItem
                          onClick={() => setLifecycleUser(user)}
                          className="cursor-pointer gap-2 text-emerald-600 focus:text-emerald-600 dark:text-emerald-400"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Dar de alta</span>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => setLifecycleUser(user)}
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Dar de baja</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.roles?.map((r, i) => (
                    <Badge
                      key={i}
                      variant={
                        r.role.name === 'superadmin'
                          ? 'destructive'
                          : r.role.name === 'admin'
                          ? 'admin'
                          : 'user'
                      }
                      className="text-[10px] py-0 px-2"
                    >
                      <span>{r.role.name}</span>
                    </Badge>
                  ))}
                  {user.twoFactor?.isEnabled && (
                    <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-500/30">
                      <ShieldCheck className="h-3 w-3" />
                      <span>2FA</span>
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingUser(user)}
                  className="h-7 text-xs text-primary gap-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Detalles</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Modal de Detalles de Usuario */}
      <UserDetailsDialog
        user={viewingUser}
        open={Boolean(viewingUser)}
        onOpenChange={(open) => !open && setViewingUser(null)}
      />

      {/* Modal de Edición de Usuario */}
      <EditUserDialog
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />

      {/* Modal de Confirmación de Baja / Alta */}
      <UserLifecycleDialog
        user={lifecycleUser}
        open={Boolean(lifecycleUser)}
        onOpenChange={(open) => !open && setLifecycleUser(null)}
      />
    </div>
  );
};
