
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import ResumenSection from '@/components/dashboard/ResumenSection';
import InventarioSection from '@/components/dashboard/InventarioSection';
import ComprasSection from '@/components/dashboard/ComprasSection';

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
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">Ventas</h2>
            <p className="text-muted-foreground">Registro de ventas realizadas - Próximamente</p>
          </div>
        );
      case 'clientes':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">Clientes</h2>
            <p className="text-muted-foreground">Base de datos de clientes - Próximamente</p>
          </div>
        );
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
