import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            if (
              normalized.includes('/node_modules/react/') ||
              normalized.includes('/node_modules/react-dom/') ||
              normalized.includes('/node_modules/react-router/') ||
              normalized.includes('/node_modules/react-router-dom/')
            ) {
              return 'vendor-react';
            }
            if (normalized.includes('/@tanstack/')) {
              return 'vendor-tanstack';
            }
            if (normalized.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            if (normalized.includes('/@radix-ui/')) {
              return 'vendor-radix';
            }
            if (normalized.includes('/recharts/') || normalized.includes('/d3-')) {
              return 'vendor-charts';
            }
            if (normalized.includes('/zxcvbn/')) {
              return 'vendor-zxcvbn';
            }
          }
        },
      },
    },
  },
});
