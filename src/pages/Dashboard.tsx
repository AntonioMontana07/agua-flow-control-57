
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Sidebar from '@/components/layout/Sidebar';
import InventoryAlerts from '@/components/dashboard/InventoryAlerts';
import { useDatabase } from '@/hooks/useDatabase';
import { useNotifications } from '@/hooks/useNotifications';
import { ProductoService } from '@/services/ProductoService';

// Lazy load components only when needed
const LazyResumenSection = lazy(() => import('@/components/dashboard/ResumenSection'));
const LazyInventarioSection = lazy(() => import('@/components/dashboard/InventarioSection'));
const LazyPedidosSection = lazy(() => import('@/components/dashboard/PedidosSection'));
const LazyComprasSection = lazy(() => import('@/components/dashboard/ComprasSection'));
const LazyGastosSection = lazy(() => import('@/components/dashboard/GastosSection'));
const LazyVentasSection = lazy(() => import('@/components/dashboard/VentasSection'));
const LazyClientesSection = lazy(() => import('@/components/dashboard/ClientesSection'));
const LazyReportesSection = lazy(() => import('@/components/dashboard/ReportesSection'));

const SectionLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Cargando sección...</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isInitialized, error } = useDatabase();
  useNotifications(); // Inicializar notificaciones
  const [activeSection, setActiveSection] = useState('resumen');
  const [alertsDismissed, setAlertsDismissed] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);

  useEffect(() => {
    if (isInitialized) {
      cargarProductos();
    }
  }, [isInitialized]);

  const cargarProductos = async () => {
    try {
      const productosData = await ProductoService.obtenerTodos();
      const productosConEstado = productosData.map(producto => ({
        ...producto,
        estado: producto.cantidad < producto.minimo ? 'Crítico' : 
               producto.cantidad < producto.minimo * 2 ? 'Bajo' : 'Disponible'
      }));
      setProductos(productosConEstado);
    } catch (error) {
      console.error('Error al cargar productos para alertas:', error);
      setProductos([]);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/82ad7edd-037f-444b-b6ea-1c8b060bc0d5.png" 
            alt="BIOX Logo" 
            className="h-16 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-muted-foreground">
            {error ? `Error: ${error}` : 'Inicializando base de datos...'}
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <Suspense fallback={<SectionLoader />}>
        {(() => {
          switch (activeSection) {
            case 'resumen':
              return <LazyResumenSection />;
            case 'inventario':
              return <LazyInventarioSection />;
            case 'pedidos':
              return <LazyPedidosSection />;
            case 'compras':
              return <LazyComprasSection />;
            case 'gastos':
              return <LazyGastosSection />;
            case 'ventas':
              return <LazyVentasSection />;
            case 'clientes':
              return <LazyClientesSection />;
            case 'reportes':
              return <LazyReportesSection />;
            default:
              return <LazyResumenSection />;
          }
        })()}
      </Suspense>
    );
  };

  const productosProblematicos = productos.filter(p => p.estado === 'Crítico' || p.estado === 'Bajo');
  const mostrarAlertas = productos.length > 0 && productosProblematicos.length > 0 && !alertsDismissed;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-4 md:hidden">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            
            {mostrarAlertas && (
              <InventoryAlerts 
                productos={productos}
                onDismiss={() => setAlertsDismissed(true)}
              />
            )}
            
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
