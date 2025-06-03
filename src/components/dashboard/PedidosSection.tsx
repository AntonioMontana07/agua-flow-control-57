
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package, Calendar, Clock, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PedidoService, Pedido } from '@/services/PedidoService';
import PedidoForm from './PedidoForm';
import PedidoDetalle from './PedidoDetalle';

const PedidosSection: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await PedidoService.obtenerTodos();
      setPedidos(data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const eliminarPedido = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        await PedidoService.eliminar(id);
        toast({
          title: "Pedido eliminado",
          description: "El pedido se ha eliminado correctamente"
        });
        cargarPedidos();
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el pedido",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setShowDetalle(true);
  };

  const handleCloseDetalle = () => {
    setSelectedPedido(null);
    setShowDetalle(false);
  };

  const totalPedidos = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Pedidos BIOX</h2>
            <p className="text-muted-foreground">Gestión de pedidos de entrega</p>
          </div>
        </div>
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Pedidos BIOX</h2>
          <p className="text-muted-foreground">Gestión de pedidos de entrega</p>
        </div>
        <PedidoForm onPedidoCreated={cargarPedidos} />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pedidos.length}</div>
            <p className="text-xs text-muted-foreground">Pedidos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">S/{totalPedidos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor de todos los pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pedidos.filter(p => p.fecha === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Pedidos de hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pedido.clienteNombre}</div>
                        <div className="text-sm text-muted-foreground">{pedido.clienteDireccion}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pedido.productoNombre}</div>
                        <div className="text-sm text-muted-foreground">S/{pedido.precio.toFixed(2)} c/u</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pedido.cantidad}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-green-600">S/{pedido.total.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{pedido.horaEntrega}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetalle(pedido)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarPedido(pedido.id!)}
                          title="Eliminar pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <PedidoDetalle 
        pedido={selectedPedido}
        isOpen={showDetalle}
        onClose={handleCloseDetalle}
      />
    </div>
  );
};

export default PedidosSection;
