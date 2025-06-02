
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import ResumenSection from '@/components/dashboard/ResumenSection';
import InventarioSection from '@/components/dashboard/InventarioSection';
import ComprasSection from '@/components/dashboard/ComprasSection';
import VentasSection from '@/components/dashboard/VentasSection';
import ClientesSection from '@/components/dashboard/ClientesSection';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('resumen');

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
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">Reportes</h2>
            <p className="text-muted-foreground">Análisis y reportes detallados - Próximamente</p>
          </div>
        );
      default:
        return <ResumenSection />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
