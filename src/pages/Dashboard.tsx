
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Sidebar from '@/components/layout/Sidebar';
import ResumenSection from '@/components/dashboard/ResumenSection';
import InventarioSection from '@/components/dashboard/InventarioSection';
import PedidosSection from '@/components/dashboard/PedidosSection';
import ComprasSection from '@/components/dashboard/ComprasSection';
import GastosSection from '@/components/dashboard/GastosSection';
import VentasSection from '@/components/dashboard/VentasSection';
import ClientesSection from '@/components/dashboard/ClientesSection';
import ReportesSection from '@/components/dashboard/ReportesSection';
import InventoryAlerts from '@/components/dashboard/InventoryAlerts';
import { useDatabase } from '@/hooks/useDatabase';
import { ProductoService } from '@/services/ProductoService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isInitialized, error } = useDatabase();
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
    switch (activeSection) {
      case 'resumen':
        return <ResumenSection />;
      case 'inventario':
        return <InventarioSection />;
      case 'pedidos':
        return <PedidosSection />;
      case 'compras':
        return <ComprasSection />;
      case 'gastos':
        return <GastosSection />;
      case 'ventas':
        return <VentasSection />;
      case 'clientes':
        return <ClientesSection />;
      case 'reportes':
        return <ReportesSection />;
      default:
        return <ResumenSection />;
    }
  };

  // Solo mostrar alertas si hay productos y hay algunos críticos o bajos
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
            {/* Header con botón de menú para móvil */}
            <div className="flex items-center gap-4 mb-4 md:hidden">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            
            {/* Mostrar alertas de inventario solo si hay productos con problemas */}
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
