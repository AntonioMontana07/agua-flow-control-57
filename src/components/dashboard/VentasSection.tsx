
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, Clock, User } from 'lucide-react';
import VentaForm from './VentaForm';

interface Venta {
  id: string;
  clienteId: string;
  clienteNombre: string;
  hora: string;
  fecha: string;
  precio: number;
  descripcion?: string;
}

const VentasSection: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([
    {
      id: '1',
      clienteId: '1',
      clienteNombre: 'Juan Pérez',
      hora: '09:30',
      fecha: '2024-06-02',
      precio: 30.00,
      descripcion: 'Entrega de 2 garrafones'
    },
    {
      id: '2',
      clienteId: '2',
      clienteNombre: 'María González',
      hora: '14:15',
      fecha: '2024-06-02',
      precio: 15.00,
      descripcion: 'Entrega de 1 garrafón'
    }
  ]);
  const [showForm, setShowForm] = useState(false);

  // Clientes disponibles (normalmente vendrían de un contexto o API)
  const clientes = [
    { id: '1', nombre: 'Juan Pérez' },
    { id: '2', nombre: 'María González' },
    { id: '3', nombre: 'Carlos López' }
  ];

  const handleAddVenta = (ventaData: Omit<Venta, 'id' | 'fecha' | 'clienteNombre'>) => {
    const cliente = clientes.find(c => c.id === ventaData.clienteId);
    const newVenta: Venta = {
      ...ventaData,
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      clienteNombre: cliente?.nombre || 'Cliente Desconocido'
    };
    
    setVentas(prev => [newVenta, ...prev]);
    setShowForm(false);
  };

  const totalVentasHoy = ventas
    .filter(v => v.fecha === new Date().toISOString().split('T')[0])
    .reduce((sum, v) => sum + v.precio, 0);

  const ventasHoy = ventas.filter(v => v.fecha === new Date().toISOString().split('T')[0]).length;

  if (showForm) {
    return (
      <div className="space-y-6">
        <VentaForm 
          clientes={clientes}
          onSubmit={handleAddVenta}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Ventas</h2>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Venta
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventasHoy}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/{totalVentasHoy.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ventas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/{ventas.reduce((sum, v) => sum + v.precio, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ventas.map((venta) => (
              <div key={venta.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{venta.clienteNombre}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {venta.hora}
                      </div>
                      <div>
                        {new Date(venta.fecha).toLocaleDateString()}
                      </div>
                    </div>
                    {venta.descripcion && (
                      <p className="text-sm text-muted-foreground italic">
                        {venta.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      S/{venta.precio.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasSection;
