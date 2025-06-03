
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, DollarSign, TrendingUp, Clock, User, Package } from 'lucide-react';
import VentaForm from './VentaForm';
import { VentaService } from '@/services/VentaService';
import { ClienteService } from '@/services/ClienteService';
import { Venta, Cliente } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

const VentasSection: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([cargarVentas(), cargarClientes()]);
  };

  const cargarVentas = async () => {
    try {
      const ventasData = await VentaService.obtenerTodas();
      setVentas(ventasData.filter(v => v.id !== undefined) as Venta[]);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive"
      });
    }
  };

  const cargarClientes = async () => {
    try {
      const clientesData = await ClienteService.obtenerTodos();
      setClientes(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVenta = async (ventaData: any) => {
    try {
      const cliente = clientes.find(c => c.id?.toString() === ventaData.clienteId);
      const nuevaVenta = {
        ...ventaData,
        clienteId: parseInt(ventaData.clienteId),
        clienteNombre: cliente?.nombre || 'Cliente Desconocido',
        fecha: new Date().toISOString().split('T')[0]
      };
      
      await VentaService.crear(nuevaVenta);
      await cargarVentas();
      setShowForm(false);
      
      toast({
        title: "Éxito",
        description: "Venta registrada correctamente e inventario actualizado"
      });
    } catch (error: any) {
      console.error('Error al registrar venta:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la venta",
        variant: "destructive"
      });
    }
  };

  const totalVentasHoy = ventas
    .filter(v => v.fecha === new Date().toISOString().split('T')[0])
    .reduce((sum, v) => sum + v.precio, 0);

  const ventasHoy = ventas.filter(v => v.fecha === new Date().toISOString().split('T')[0]).length;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando ventas...</div>;
  }

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
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{venta.productoNombre}</span>
                      <span className="text-sm text-muted-foreground">x{venta.cantidad}</span>
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
                    <div className="text-sm text-muted-foreground">
                      S/{venta.precioUnitario.toFixed(2)} c/u
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
