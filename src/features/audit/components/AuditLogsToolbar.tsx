import { SearchInput } from '@/components/shared/SearchInput';

export type AuditActionFilter = 'ALL' | 'LOGIN' | 'UPDATE_USER' | 'UPLOAD_FILE' | 'DELETE_FILE';

interface AuditLogsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  actionFilter: AuditActionFilter;
  onActionFilterChange: (action: AuditActionFilter) => void;
}

export const AuditLogsToolbar = ({
  search,
  onSearchChange,
  actionFilter,
  onActionFilterChange,
}: AuditLogsToolbarProps) => {
  const actions: AuditActionFilter[] = ['ALL', 'LOGIN', 'UPDATE_USER', 'UPLOAD_FILE', 'DELETE_FILE'];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 notranslate">
      <SearchInput
        placeholder="Buscar por IP, usuario, endpoint..."
        value={search}
        onChange={onSearchChange}
        className="flex-1 sm:max-w-xs"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40 overflow-x-auto">
          {actions.map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => onActionFilterChange(act)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer whitespace-nowrap font-mono ${
                actionFilter === act
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{act === 'ALL' ? 'Todas' : act}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

