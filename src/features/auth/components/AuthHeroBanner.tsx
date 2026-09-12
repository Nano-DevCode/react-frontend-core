import { ShieldCheck } from 'lucide-react';

export const AuthHeroBanner = () => {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex notranslate">
      {/* Fondo Dot Grid Animado */}
      <div className="absolute inset-0 dot-grid opacity-20 text-slate-400 pointer-events-none" />
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      {/* Header Superior */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/40">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight">
            <span>SaaS Enterprise Security</span>
          </span>
          <p className="text-[10px] text-slate-400 font-mono">
            <span>Plataforma de Control Administrativo</span>
          </p>
        </div>
      </div>

      {/* Hero Central */}
      <div className="relative z-10 my-auto max-w-md space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span><span>Autenticación de Grado Bancario Activa</span></span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
          <span>Control de acceso, auditoría y archivos a máxima velocidad.</span>
        </h2>

        <p className="text-sm text-slate-400 leading-relaxed">
          <span>
            Protección en caliente con ClamAV Antivirus, compresión automática WebP, trazabilidad con visor de diferencias JSON y 2FA desacoplado.
          </span>
        </p>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-center">
          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-lg font-bold text-white font-mono"><span>99.99%</span></span>
            <p className="text-[10px] text-slate-400"><span>Disponibilidad</span></p>
          </div>
          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-lg font-bold text-emerald-400 font-mono"><span>2FA</span></span>
            <p className="text-[10px] text-slate-400"><span>Protección TOTP</span></p>
          </div>
          <div className="p-2 rounded-xl bg-white/5">
            <span className="text-lg font-bold text-indigo-400 font-mono"><span>S3+WebP</span></span>
            <p className="text-[10px] text-slate-400"><span>Optimización</span></p>
          </div>
        </div>
      </div>

      {/* Footer Izquierdo */}
      <div className="relative z-10 text-xs text-slate-400">
        <span>© 2026 SaaS Enterprise Platform. Todos los derechos reservados.</span>
      </div>
    </div>
  );
};

