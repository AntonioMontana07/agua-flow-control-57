import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from 'lucide-react';
import { CompraService } from '@/services/CompraService';
import { VentaService } from '@/services/VentaService';
import { GastoService } from '@/services/GastoService';
import { Compra, Venta, Gasto } from '@/lib/database';

const ReportesSection: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [compras, setCompras] = useState<Compra[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [comprasData, ventasData, gastosData] = await Promise.all([
        CompraService.obtenerTodas(),
        VentaService.obtenerTodas(),
        GastoService.obtenerTodos()
      ]);
      
      setCompras(comprasData);
      setVentas(ventasData);
      setGastos(gastosData);
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

  const totalCompras = comprasFiltradas.reduce((sum, compra) => sum + compra.total, 0);
  const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + (venta.cantidad * venta.precioUnitario), 0);
  const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  const ganancia = totalVentas - totalCompras - totalGastos;

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
              <p className="text-center text-muted-foreground py-4">No hay ventas en este período</p>
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
                          S/{(venta.cantidad * venta.precioUnitario).toFixed(2)}
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
              <p className="text-center text-muted-foreground py-4">No hay compras en este período</p>
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
              <p className="text-center text-muted-foreground py-4">No hay gastos en este período</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastosFiltrados.slice(0, 5).map((gasto) => (
                    <TableRow key={gasto.id}>
                      <TableCell className="font-medium">{gasto.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-orange-600">
                          S/{gasto.cantidad.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportesSection;
