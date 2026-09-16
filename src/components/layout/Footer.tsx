import { Code2, Heart } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="notranslate w-full border-t border-border/80 bg-card/40 backdrop-blur-md pb-24 lg:pb-8 pt-6 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        {/* Izquierda: Marca y Autoría */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Code2 className="h-3.5 w-3.5" />
            </div>
            <span>SaaS Enterprise Security</span>
          </div>

          <span className="hidden sm:inline text-border">•</span>

          <div className="flex items-center gap-1.5">
            <span>Hecho por mí —</span>
            <span className="font-semibold text-foreground">Manuel Eduardo</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" />
          </div>
        </div>

        {/* Derecha: Estado de sistemas y Copyright */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistemas operacionales</span>
          </div>

          <span className="text-border">•</span>

          <span>© {currentYear} Manuel Eduardo</span>
        </div>
      </div>
    </footer>
  );
};
