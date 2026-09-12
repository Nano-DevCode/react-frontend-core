import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const AppPreloader = () => {
  return (
    <div className="notranslate fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.95, 1.05, 1], opacity: 1 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="relative mb-6 flex items-center justify-center"
      >
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />
        <div className="relative rounded-2xl border border-border/80 bg-card p-5 shadow-2xl">
          <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </motion.div>

      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        <span>Plataforma SaaS Empresarial & Administrativa</span>
      </h2>
      <p className="mt-1 mb-6 text-xs text-muted-foreground">
        <span>Cargando recursos del sistema y verificando sesión segura...</span>
      </p>

      <div className="w-56 overflow-hidden rounded-full">
        <Progress value={undefined} className="h-1.5 w-full" />
      </div>
    </div>
  );
};

