import { useState } from 'react';
import { Edit3, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserStatusSwitch } from './UserStatusSwitch';
import { UserRoleDialog } from './UserRoleDialog';
import type { UserRecord } from '@/types';

interface MobileUserCardsProps {
  users: UserRecord[];
}

export const MobileUserCards = ({ users }: MobileUserCardsProps) => {
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  return (
    <div className="notranslate space-y-3">
      {users.map((user) => {
        const initials = (user.name?.[0] || user.email[0] || 'U').toUpperCase();
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
                    <span className="font-bold text-sm text-foreground">
                      <span>{user.name || 'Sin nombre registrado'}</span>
                    </span>
                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                      <span>{user.email}</span>
                    </span>
                  </div>
                </div>

                <UserStatusSwitch userId={user.id} isActive={user.isActive} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.roles?.map((r, i) => (
                    <Badge
                      key={i}
                      variant={r.role.name === 'admin' ? 'admin' : 'user'}
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
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(user)}
                  className="h-8 gap-1 text-xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Roles</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <UserRoleDialog
        user={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />
    </div>
  );
};

