
import { lazy } from 'react';

export const useLazyImport = () => {
  // Componentes del dashboard con importación dinámica
  const LazyResumenSection = lazy(() => import('@/components/dashboard/ResumenSection'));
  const LazyInventarioSection = lazy(() => import('@/components/dashboard/InventarioSection'));
  const LazyVentasSection = lazy(() => import('@/components/dashboard/VentasSection'));
  const LazyComprasSection = lazy(() => import('@/components/dashboard/ComprasSection'));
  const LazyPedidosSection = lazy(() => import('@/components/dashboard/PedidosSection'));
  const LazyClientesSection = lazy(() => import('@/components/dashboard/ClientesSection'));
  const LazyGastosSection = lazy(() => import('@/components/dashboard/GastosSection'));
  const LazyReportesSection = lazy(() => import('@/components/dashboard/ReportesSection'));
  
  // Páginas con importación dinámica
  const LazyAuth = lazy(() => import('@/pages/Auth'));
  const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
  const LazyIndex = lazy(() => import('@/pages/Index'));
  const LazyNotFound = lazy(() => import('@/pages/NotFound'));

  return {
    // Dashboard sections
    LazyResumenSection,
    LazyInventarioSection,
    LazyVentasSection,
    LazyComprasSection,
    LazyPedidosSection,
    LazyClientesSection,
    LazyGastosSection,
    LazyReportesSection,
    
    // Pages
    LazyAuth,
    LazyDashboard,
    LazyIndex,
    LazyNotFound
  };
};
