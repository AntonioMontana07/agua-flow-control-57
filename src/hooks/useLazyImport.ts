
import { lazy } from 'react';

export const useLazyImport = () => {
  // Solo páginas principales - los componentes del dashboard se cargan dinámicamente
  const LazyAuth = lazy(() => import('@/pages/Auth'));
  const LazyDashboard = lazy(() => import('@/pages/Dashboard'));
  const LazyIndex = lazy(() => import('@/pages/Index'));
  const LazyNotFound = lazy(() => import('@/pages/NotFound'));

  return {
    // Solo páginas principales
    LazyAuth,
    LazyDashboard,
    LazyIndex,
    LazyNotFound
  };
};
