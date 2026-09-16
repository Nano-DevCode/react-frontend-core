import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { MobileNavDrawer } from './MobileNavDrawer';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="notranslate flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar para Desktop (>= 1024px) */}
      <Sidebar />

      {/* Menú táctil Vaul para Móvil (< 1024px) */}
      <MobileNavDrawer
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />

      {/* Contenedor Principal */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Footer Empresarial */}
        <Footer />

        {/* Barra de navegación inferior flotante para Móvil */}
        <BottomNav />
      </div>
    </div>
  );
};

