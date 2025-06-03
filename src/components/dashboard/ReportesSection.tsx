
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Crown, Target } from 'lucide-react';
import { CompraService } from '@/services/CompraService';
import { VentaService } from '@/services/VentaService';
import { GastoService } from '@/services/GastoService';
import { PedidoService } from '@/services/PedidoService';
import { Compra, Venta, Gasto, Pedido } from '@/lib/database';

const ReportesSection: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Solo cargar datos reales, sin datos de prueba
      const [comprasData, ventasData, gastosData, pedidosData] = await Promise.all([
        CompraService.obtenerTodas(),
        VentaService.obtenerTodas(),
        GastoService.obtenerTodos(),
        PedidoService.obtenerTodos()
      ]);
      
      setCompras(comprasData);
      setVentas(ventasData);
      setGastos(gastosData);
      setPedidos(pedidosData);
      console.log('Reportes cargados - datos reales únicamente');
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarPorFecha = <T extends { fecha: string }>(datos: T[]): T[] => {
    if (!fechaInicio && !fechaFin) return datos;
    
    return datos.filter(item => {
      const fechaItem = new Date(item.fecha);
      const inicio = fechaInicio ? new Date(fechaInicio) : null;
      const fin = fechaFin ? new Date(fechaFin) : null;
      
      if (inicio && fechaItem < inicio) return false;
      if (fin && fechaItem > fin) return false;
      return true;
    });
  };

  const comprasFiltradas = filtrarPorFecha(compras);
  const ventasFiltradas = filtrarPorFecha(ventas);
  const gastosFiltrados = filtrarPorFecha(gastos);
  const pedidosFiltrados = filtrarPorFecha(pedidos);

  // Cálculos financieros - usando el precio real de las ventas
  const totalCompras = comprasFiltradas.reduce((sum, compra) => sum + compra.total, 0);
  const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + venta.precio, 0);
  const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  const ganancia = totalVentas - totalCompras - totalGastos;

  // Análisis de clientes
  const obtenerClienteMasPedidos = () => {
    if (pedidosFiltrados.length === 0) return null;
    
    const clientePedidos = pedidosFiltrados.reduce((acc, pedido) => {
      const clienteId = pedido.clienteId;
      if (!acc[clienteId]) {
        acc[clienteId] = {
          nombre: pedido.clienteNombre,
          pedidos: 0,
          total: 0
        };
      }
      acc[clienteId].pedidos++;
      acc[clienteId].total += pedido.total;
      return acc;
    }, {} as Record<number, { nombre: string; pedidos: number; total: number }>);

    return Object.values(clientePedidos).reduce((max, cliente) => 
      cliente.pedidos > max.pedidos ? cliente : max
    );
  };

  const obtenerClienteMasCompras = () => {
    if (ventasFiltradas.length === 0) return null;
    
    const clienteCompras = ventasFiltradas.reduce((acc, venta) => {
      const clienteId = venta.clienteId;
      if (!acc[clienteId]) {
        acc[clienteId] = {
          nombre: venta.clienteNombre,
          compras: 0,
          total: 0
        };
      }
      acc[clienteId].compras++;
      acc[clienteId].total += venta.precio;
      return acc;
    }, {} as Record<number, { nombre: string; compras: number; total: number }>);

    return Object.values(clienteCompras).reduce((max, cliente) => 
      cliente.total > max.total ? cliente : max
    );
  };

  const clienteMasPedidos = obtenerClienteMasPedidos();
  const clienteMasCompras = obtenerClienteMasCompras();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Reportes</h2>
            <p className="text-muted-foreground">Análisis de compras, ventas y gastos</p>
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
          <h2 className="text-3xl font-bold text-primary">Reportes</h2>
          <p className="text-muted-foreground">Análisis de compras, ventas y gastos</p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">S/{totalVentas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{ventasFiltradas.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">S/{totalCompras.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{comprasFiltradas.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">S/{totalGastos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{gastosFiltrados.length} transacciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia</CardTitle>
            <DollarSign className={`h-4 w-4 ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              S/{ganancia.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {ganancia >= 0 ? 'Beneficio' : 'Pérdida'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente Más Pedidos</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {clienteMasPedidos ? (
              <div>
                <div className="text-lg font-bold text-blue-600">{clienteMasPedidos.nombre}</div>
                <p className="text-sm text-muted-foreground">{clienteMasPedidos.pedidos} pedidos</p>
                <p className="text-xs text-muted-foreground">Total: S/{clienteMasPedidos.total.toFixed(2)}</p>
              </div>
            ) : (
              <div className="text-muted-foreground">No hay datos de pedidos</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliente Más Compras</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {clienteMasCompras ? (
              <div>
                <div className="text-lg font-bold text-purple-600">{clienteMasCompras.nombre}</div>
                <p className="text-sm text-muted-foreground">{clienteMasCompras.compras} compras</p>
                <p className="text-xs text-muted-foreground">Total: S/{clienteMasCompras.total.toFixed(2)}</p>
              </div>
            ) : (
              <div className="text-muted-foreground">No hay datos de ventas</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tablas de transacciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Ventas ({ventasFiltradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ventasFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay ventas registradas</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Las ventas aparecerán aquí cuando las registres
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventasFiltradas.slice(0, 5).map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-medium">{venta.productoNombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-green-600">
                          S/{venta.precio.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Compras ({comprasFiltradas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {comprasFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay compras registradas</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Las compras aparecerán aquí cuando las registres
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprasFiltradas.slice(0, 5).map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell className="font-medium">{compra.productoNombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-red-600">
                          S/{compra.total.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />
              Gastos ({gastosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gastosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay gastos registrados</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Los gastos aparecerán aquí cuando los registres
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportesSection;
