
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
            '@radix-ui/react-checkbox'
          ],
          
          // Bibliotecas de routing y query
          'routing-vendor': ['react-router-dom', '@tanstack/react-query'],
          
          // Bibliotecas de utilidades
          'utils-vendor': ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          
          // Bibliotecas de iconos y gráficos
          'graphics-vendor': ['lucide-react', 'recharts'],
          
          // Bibliotecas específicas de funcionalidad
          'features-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Capacitor y plugins móviles
          'mobile-vendor': ['@capacitor/core', '@capacitor/geolocation', '@capacitor/local-notifications'],
          
          // Servicios y hooks
          'services': [
            './src/services/ProductoService',
            './src/services/ClienteService',
            './src/services/VentaService',
            './src/services/CompraService',
            './src/services/PedidoService',
            './src/services/GastoService',
            './src/services/NotificationService',
            './src/services/MobilePermissionsService',
            './src/services/ScheduledNotificationService'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500
  }
}));
