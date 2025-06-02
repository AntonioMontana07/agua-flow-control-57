
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import ResumenSection from '@/components/dashboard/ResumenSection';
import InventarioSection from '@/components/dashboard/InventarioSection';
import ComprasSection from '@/components/dashboard/ComprasSection';
import VentasSection from '@/components/dashboard/VentasSection';
import ClientesSection from '@/components/dashboard/ClientesSection';
import ReportesSection from '@/components/dashboard/ReportesSection';
import InventoryAlerts from '@/components/dashboard/InventoryAlerts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('resumen');
  const [alertsDismissed, setAlertsDismissed] = useState(false);

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
      case 'compras':
        return <ComprasSection />;
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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
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
  );
};

export default Dashboard;
