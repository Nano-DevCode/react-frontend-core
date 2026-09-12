import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  incidentId: string;
  copied: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      incidentId: '',
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generación de un código opaco único de incidente (evita fugar nombres de archivos o rutas)
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      hasError: true,
      error,
      incidentId: `ERR-${randomHex}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    // En desarrollo o pruebas internas se registra en consola
    if (import.meta.env.DEV && typeof console !== 'undefined' && console.error) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      incidentId: '',
      copied: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  handleCopyIncidentId = (): void => {
    if (this.state.incidentId && navigator.clipboard) {
      navigator.clipboard.writeText(this.state.incidentId);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isProd = import.meta.env.PROD;

      return (
        <div className="notranslate min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="max-w-xl w-full rounded-2xl border border-destructive/20 bg-card p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in fade-in-50 duration-300">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
              <ShieldAlert className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
                <span>Ha ocurrido un error inesperado</span>
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                <span>
                  La interfaz encontró una excepción de ejecución. El estado se
                  ha aislado de forma segura para prevenir fallos en cadena.
                </span>
              </p>
            </div>

            {/* Código opaco de incidente para soporte técnico (Sin filtrar memoria ni stack traces en PROD) */}
            {this.state.incidentId && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono">
                <span className="text-muted-foreground">Código de Incidente:</span>
                <span className="font-bold text-foreground">
                  {this.state.incidentId}
                </span>
                <button
                  type="button"
                  onClick={this.handleCopyIncidentId}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-1 p-0.5"
                  title="Copiar código de incidente"
                >
                  {this.state.copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={this.handleReset}
                className="gap-2 h-9 text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reintentar Vista</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={this.handleGoHome}
                className="gap-2 h-9 text-xs"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Ir al Panel Principal</span>
              </Button>
            </div>

            {/* En desarrollo (DEV) se permite inspección técnica; en producción (PROD) se oculta para mitigar fuga de información */}
            {!isProd && this.state.error && (
              <div className="pt-4 border-t border-border/60 text-left">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
                >
                  <span>
                    <span>Detalles técnicos (Solo entorno de desarrollo)</span>
                  </span>
                  {this.state.showDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 rounded-xl bg-muted/50 p-3 font-mono text-[11px] text-destructive overflow-x-auto border border-border/60 max-h-48 scrollbar-thin">
                    <p className="font-bold">
                      <span>{this.state.error.name}: </span>
                      <span>{this.state.error.message}</span>
                    </p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 text-[10px] text-muted-foreground whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}
