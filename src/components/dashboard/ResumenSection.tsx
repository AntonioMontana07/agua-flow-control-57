
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Users, TrendingUp, Clock, Truck } from 'lucide-react';
import { VentaService } from '@/services/VentaService';
import { ClienteService } from '@/services/ClienteService';
import { ProductoService } from '@/services/ProductoService';
import { PedidoService } from '@/services/PedidoService';
import { Venta, Cliente, Producto, Pedido } from '@/lib/database';

const ResumenSection: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [ventasData, clientesData, productosData, pedidosData] = await Promise.all([
        VentaService.obtenerTodas(),
        ClienteService.obtenerTodos(),
        ProductoService.obtenerTodos(),
        PedidoService.obtenerTodos()
      ]);
      
      setVentas(ventasData);
      setClientes(clientesData);
      setProductos(productosData);
      setPedidos(pedidosData);
    } catch (error) {
      console.error('Error al cargar datos del resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const hoy = new Date().toISOString().split('T')[0];
  
  const pedidosHoy = pedidos.filter(p => p.fecha === hoy);
  const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
  const pedidosEnCamino = pedidos.filter(p => p.estado === 'En Camino').length;
  const pedidosEntregados = pedidos.filter(p => p.estado === 'Entregado').length;
  
  const ventasHoy = ventas.filter(v => v.fecha === hoy);
  const ingresosHoy = ventasHoy.reduce((sum, v) => sum + v.precio, 0);
  
  const clientesActivos = clientes.length;
  
  const entregasCompletadasHoy = pedidos.filter(p => 
    p.fechaEntrega === hoy && p.estado === 'Entregado'
  ).length;

  const productosStockBajo = productos.filter(p => p.cantidad <= p.minimo);

  const stats = [
    {
      title: 'Pedidos Pendientes',
      value: pedidosPendientes.toString(),
      change: pedidosPendientes > 0 ? `${pedidosPendientes} por procesar` : 'Todo al día',
      icon: Clock,
      color: 'text-red-600'
    },
    {
      title: 'En Camino',
      value: pedidosEnCamino.toString(),
      change: pedidosEnCamino > 0 ? `${pedidosEnCamino} en ruta` : 'Sin entregas',
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      title: 'Entregados Hoy',
      value: entregasCompletadasHoy.toString(),
      change: entregasCompletadasHoy > 0 ? `+${entregasCompletadasHoy} completados` : '0 entregas',
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: 'Ventas del Día',
      value: `S/${ingresosHoy.toFixed(2)}`,
      change: ingresosHoy > 0 ? `+${ventasHoy.length} ventas` : '0 ventas',
      icon: DollarSign,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando resumen...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-primary">Resumen del Día</h2>
        <p className="text-muted-foreground">Vista general de tu actividad como repartidor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            {pedidos.filter(p => p.estado !== 'Entregado').length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes entregas pendientes</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Las entregas aparecerán aquí cuando tengas pedidos activos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.filter(p => p.estado !== 'Entregado').slice(0, 3).map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{pedido.clienteNombre}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            pedido.estado === 'Pendiente' ? 'bg-red-100 text-red-800' :
                            pedido.estado === 'En Camino' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {pedido.estado}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pedido.productoNombre} x{pedido.cantidad}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Entrega: {new Date(pedido.fechaEntrega).toLocaleDateString()} - {pedido.horaEntrega}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        S/{pedido.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                {pedidos.filter(p => p.estado !== 'Entregado').length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    y {pedidos.filter(p => p.estado !== 'Entregado').length - 3} más...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            {productosStockBajo.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay productos con stock bajo</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Los productos con stock bajo aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {productosStockBajo.slice(0, 3).map((producto) => (
                  <div key={producto.id} className="border rounded-lg p-3 border-orange-200 bg-orange-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-orange-800">{producto.nombre}</h4>
                        <p className="text-sm text-orange-600">
                          Stock: {producto.cantidad} / Mínimo: {producto.minimo}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-orange-700">
                        S/{producto.precio}
                      </span>
                    </div>
                  </div>
                ))}
                {productosStockBajo.length > 3 && (
                  <p className="text-sm text-orange-600 text-center">
                    y {productosStockBajo.length - 3} productos más con stock bajo
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumenSection;
