
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Share, Edit, Trash2, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PedidoService, Pedido } from '@/services/PedidoService';
import PedidoForm from './PedidoForm';

const PedidosSection: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

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

  const compartirPorWhatsApp = (pedido: Pedido) => {
    const mensaje = `🛒 *PEDIDO*

👤 *Cliente:* ${pedido.clienteNombre}
📍 *Dirección:* ${pedido.clienteDireccion}

📦 *Producto:* ${pedido.productoNombre}
📊 *Cantidad:* ${pedido.cantidad}
💰 *Precio unitario:* S/${pedido.precio.toFixed(2)}
💵 *Total:* S/${pedido.total.toFixed(2)}

📅 *Fecha:* ${new Date(pedido.fecha).toLocaleDateString('es-ES')}
🕐 *Hora:* ${pedido.hora}

_Pedido generado por BIOX Sistema de Reparto_`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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

  const totalPedidos = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Pedidos</h2>
            <p className="text-muted-foreground">Gestión de pedidos de clientes</p>
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
          <h2 className="text-3xl font-bold text-primary">Pedidos</h2>
          <p className="text-muted-foreground">Gestión de pedidos de clientes</p>
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
          <CardTitle>Lista de Pedidos</CardTitle>
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                        </div>
                        <div className="text-sm text-muted-foreground">{pedido.hora}</div>
                      </div>
                    </TableCell>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => compartirPorWhatsApp(pedido)}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarPedido(pedido.id!)}
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
    </div>
  );
};

export default PedidosSection;
