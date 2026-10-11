import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/shared/SearchInput';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface UsersTableToolbarProps {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onExportCSV: () => void;
  isExporting: boolean;
}

export const UsersTableToolbar = ({
  globalFilter,
  onGlobalFilterChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onExportCSV,
  isExporting,
}: UsersTableToolbarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 notranslate">
      {/* Search reutilizable */}
      <SearchInput
        placeholder="Buscar por nombre o correo..."
        value={globalFilter}
        onChange={onGlobalFilterChange}
        className="flex-1 sm:max-w-xs"
      />

      {/* Filters & Export Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Role Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
              <span className="text-muted-foreground"><span>Rol:</span></span>
              <span className="font-semibold capitalize">
                <span>{roleFilter === 'ALL' ? 'Todos' : roleFilter}</span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 notranslate">
            <DropdownMenuItem onClick={() => onRoleFilterChange('ALL')}>
              <span>Todos los roles</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange('admin')}>
              <span>Solo Administradores</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange('user')}>
              <span>Solo Usuarios Estándar</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleFilterChange('auditor')}>
              <span>Solo Auditores</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
              <span className="text-muted-foreground"><span>Estado:</span></span>
              <span className="font-semibold">
                <span>
                  {statusFilter === 'ALL'
                    ? 'Todos'
                    : statusFilter === 'ACTIVE'
                    ? 'Activos'
                    : statusFilter === 'DELETED'
                    ? 'Papelera / Eliminados'
                    : 'Suspendidos'}
                </span>
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 notranslate">
            <DropdownMenuItem onClick={() => onStatusFilterChange('ALL')}>
              <span>Todos los estados</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange('ACTIVE')}>
              <span>Solo Activos</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange('SUSPENDED')}>
              <span>Solo Suspendidos</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange('DELETED')}>
              <span className="text-destructive font-medium">Papelera / Eliminados</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export CSV Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCSV}
          disabled={isExporting}
          className="h-9 gap-1.5 text-xs text-foreground"
        >
          <Download className="h-3.5 w-3.5 text-primary" />
          <span>{isExporting ? 'Exportando...' : 'Exportar CSV'}</span>
        </Button>
      </div>
    </div>
  );
};

