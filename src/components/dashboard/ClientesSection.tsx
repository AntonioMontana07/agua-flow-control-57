
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, MapPin, Phone } from 'lucide-react';
import ClienteForm from './ClienteForm';
import { ClienteService } from '@/services/ClienteService';
import { Cliente } from '@/lib/database';

const ClientesSection: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const clientesData = await ClienteService.obtenerTodos();
      setClientes(clientesData);
      console.log('Clientes cargados:', clientesData.length);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCliente = async (clienteData: Omit<Cliente, 'id' | 'fechaRegistro'>) => {
    try {
      await ClienteService.crear(clienteData);
      await cargarClientes(); // Recargar la lista
      setShowForm(false);
      console.log('Cliente agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar cliente:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-primary">Clientes</h2>
        </div>
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

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
              {clientes.filter(c => c.descripcion && c.descripcion.trim()).length}
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
          {clientes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay clientes registrados</p>
              <p className="text-sm text-muted-foreground mt-2">
                Los clientes aparecerán aquí cuando los registres
              </p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientesSection;
