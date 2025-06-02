
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, MapPin, Phone } from 'lucide-react';
import ClienteForm from './ClienteForm';

interface Cliente {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  descripcion?: string;
  fechaRegistro: string;
}

const ClientesSection: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nombre: 'Juan Pérez',
      direccion: 'Calle Principal #123, Colonia Centro',
      telefono: '555-0123',
      descripcion: 'Cliente frecuente',
      fechaRegistro: '2024-01-15'
    },
    {
      id: '2',
      nombre: 'María González',
      direccion: 'Av. Reforma #456, Colonia Norte',
      telefono: '555-0456',
      fechaRegistro: '2024-02-10'
    }
  ]);
  const [showForm, setShowForm] = useState(false);

  const handleAddCliente = (clienteData: Omit<Cliente, 'id' | 'fechaRegistro'>) => {
    const newCliente: Cliente = {
      ...clienteData,
      id: Date.now().toString(),
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    
    setClientes(prev => [newCliente, ...prev]);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <ClienteForm 
          onSubmit={handleAddCliente}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Clientes</h2>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Cliente
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Este Mes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.filter(c => {
                const fecha = new Date(c.fechaRegistro);
                const ahora = new Date();
                return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Descripción</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientes.filter(c => c.descripcion).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{cliente.nombre}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {cliente.direccion}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {cliente.telefono}
                    </div>
                    {cliente.descripcion && (
                      <p className="text-sm text-muted-foreground italic">
                        {cliente.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Registrado: {new Date(cliente.fechaRegistro).toLocaleDateString()}
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

export default ClientesSection;
