import { Moon, Sun, Monitor } from 'lucide-react';
import { useUIStore, type AppTheme } from '@/stores/use-ui-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const { theme, setTheme } = useUIStore();

  const handleSelect = (t: AppTheme) => {
    setTheme(t);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" aria-label="Cambiar tema">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
          <span className="sr-only"><span>Cambiar tema visual</span></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => handleSelect('light')} className="gap-2">
          <Sun className="h-4 w-4 text-amber-500" />
          <span>Claro</span>
          {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('dark')} className="gap-2">
          <Moon className="h-4 w-4 text-indigo-400" />
          <span>Oscuro</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelect('system')} className="gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span>Sistema</span>
          {theme === 'system' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

