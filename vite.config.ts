
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Bibliotecas principales de React
          'react-vendor': ['react', 'react-dom'],
          
          // Bibliotecas de UI
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-accordion',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-form'
          ],
          
          // Bibliotecas de routing y query
          'routing-vendor': ['react-router-dom', '@tanstack/react-query'],
          
          // Bibliotecas de utilidades
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          
          // Bibliotecas de iconos y gráficos
          'graphics-vendor': ['lucide-react', 'recharts'],
          
          // Bibliotecas específicas de funcionalidad
          'features-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Componentes de dashboard
          'dashboard': [
            './src/components/dashboard/ResumenSection',
            './src/components/dashboard/InventarioSection',
            './src/components/dashboard/VentasSection',
            './src/components/dashboard/ComprasSection',
            './src/components/dashboard/PedidosSection',
            './src/components/dashboard/ClientesSection',
            './src/components/dashboard/GastosSection',
            './src/components/dashboard/ReportesSection'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}));
