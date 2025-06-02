
import React, { useState } from 'react';
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isInitialized, error } = useDatabase();
  const [activeSection, setActiveSection] = useState('resumen');
  const [alertsDismissed, setAlertsDismissed] = useState(false);

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

  // Productos de ejemplo para las alertas
  const productos = [
    { id: 1, nombre: 'Bidón 20L', cantidad: 45, precio: 25.00, minimo: 10, estado: 'Disponible' },
    { id: 2, nombre: 'Bidón 10L', cantidad: 8, precio: 15.00, minimo: 10, estado: 'Bajo' },
    { id: 3, nombre: 'Botella 1L', cantidad: 120, precio: 3.50, minimo: 50, estado: 'Disponible' },
    { id: 4, nombre: 'Botella 500ml', cantidad: 5, precio: 2.00, minimo: 20, estado: 'Crítico' },
    { id: 5, nombre: 'Bidón 5L', cantidad: 25, precio: 8.00, minimo: 15, estado: 'Disponible' },
  ];

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
            
            {/* Mostrar alertas de inventario solo si no han sido descartadas */}
            {!alertsDismissed && (
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
